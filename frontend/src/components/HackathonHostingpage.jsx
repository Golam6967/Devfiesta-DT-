import React, { useState, useMemo } from 'react';
import {
  Shapes, Image as ImageIcon,
  CheckCircle, ArrowRight, ArrowLeft, ChevronDown, Users, Trash2
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { userContext } from '../hooks/AutoAuth';
import { uploadImage } from '../utils/uploadImage';
import { API_BASE_URL } from '../utils/api';

const FormInput = ({ id, name, type, placeholder, value, onChange, error }) => (
  <div>
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`df-input ${error ? '!border-red-500' : ''}`}
    />
    {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
  </div>
);

const FormSelect = ({ id, name, value, onChange, error, children }) => (
  <div>
    <div className="relative">
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className={`df-input pr-10 appearance-none ${error ? '!border-red-500' : ''}`}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-500">
        <ChevronDown size={18} />
      </div>
    </div>
    {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
  </div>
);

export default function HackathonHostingpage() {
  const navigateto = useNavigate();
  const { User } = userContext();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    hackathon_name: '',
    duration: '',
    genre: '',
    rule_book: '',
    starting_date: '',
    ending_date: '',
    judges: [{ username: '' }],
    criteria: [{ description: '' }],
  });
  const [hackathonImage, setHackathonImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleJudgeChange = (index, e) => {
    const { name, value } = e.target;
    const newJudges = [...formData.judges];
    newJudges[index][name] = value;
    setFormData(prev => ({ ...prev, judges: newJudges }));
  };

  const addJudge = () => setFormData(prev => ({ ...prev, judges: [...prev.judges, { username: '' }] }));
  const removeJudge = (index) => setFormData(prev => ({ ...prev, judges: prev.judges.filter((_, i) => i !== index) }));

  const handleCriteriaChange = (index, e) => {
    const { name, value } = e.target;
    const newCriteria = [...formData.criteria];
    newCriteria[index][name] = value;
    setFormData(prev => ({ ...prev, criteria: newCriteria }));
  };

  const addCriterion = () => setFormData(prev => ({ ...prev, criteria: [...prev.criteria, { description: '' }] }));
  const removeCriterion = (index) => setFormData(prev => ({ ...prev, criteria: prev.criteria.filter((_, i) => i !== index) }));

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      setHackathonImage(imageUrl);
      setErrors(prev => ({ ...prev, image: undefined }));
    } catch (error) {
      setHackathonImage(null);
      setImagePreview('');
      console.error("Upload failed:", error);
      setErrors(prev => ({ ...prev, image: "Image upload failed. Please try again." }));
    } finally {
      setUploading(false);
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.hackathon_name) newErrors.hackathon_name = 'Hackathon name is required.';
    if (!formData.genre) newErrors.genre = 'Please select a genre.';
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.starting_date) newErrors.starting_date = 'Start date is required.';
    if (!formData.ending_date) newErrors.ending_date = 'End date is required.';
    else if (formData.starting_date && new Date(formData.ending_date) < new Date(formData.starting_date)) {
      newErrors.ending_date = 'End date cannot be before the start date.';
    }
    if (!formData.duration) newErrors.duration = 'Duration is required (e.g., 48 Hours).';
    if (!formData.rule_book) {
      newErrors.rule_book = 'A link to the rule book is required.';
    } else if (!/^(ftp|http|https):\/\/[^ "]+$/.test(formData.rule_book)) {
      newErrors.rule_book = 'Please enter a valid URL.';
    }
    return newErrors;
  };

  const validateStep3 = () => {
    const newErrors = { criteria: [] };
    let hasError = false;
    formData.criteria.forEach((criterion, index) => {
      const criterionError = {};
      if (!criterion.description.trim()) {
        criterionError.description = "Criterion description is required.";
        hasError = true;
      }
      newErrors.criteria[index] = criterionError;
    });
    return hasError ? newErrors : {};
  };

  const validateStep4 = () => {
    const newErrors = { judges: [] };
    let hasError = false;
    formData.judges.forEach((judge, index) => {
      const judgeError = {};
      if (!judge.username.trim()) {
        judgeError.username = "Judge's username is required.";
        hasError = true;
      }
      newErrors.judges[index] = judgeError;
    });
    return hasError ? newErrors : {};
  };

  const nextStep = () => {
    let newErrors = {};
    if (step === 1) newErrors = validateStep1();
    if (step === 2) newErrors = validateStep2();
    if (step === 3) newErrors = validateStep3();
    if (step === 4) newErrors = validateStep4();

    setErrors(newErrors);

    const isValid = Object.keys(newErrors).length === 0 ||
      (newErrors.judges && newErrors.judges.every(e => Object.keys(e).length === 0)) ||
      (newErrors.criteria && newErrors.criteria.every(e => Object.keys(e).length === 0));

    if (isValid) setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const token = localStorage.getItem('token');
    const host_username = User?.user?.username;
    if (!token || !host_username) {
      setSubmitError('You need to be logged in to host a hackathon.');
      return;
    }

    const judgeUsernames = formData.judges.map(j => j.username.trim()).filter(Boolean).join(', ');
    const criteriaDescriptions = formData.criteria.map(c => c.description.trim()).filter(Boolean).join('|');

    const finalData = {
      hackathon_name: formData.hackathon_name,
      host_username,
      duration: formData.duration,
      genre: formData.genre,
      rule_book: formData.rule_book,
      starting_date: formData.starting_date,
      ending_date: formData.ending_date,
      judge_username: judgeUsernames,
      judging_criteria: criteriaDescriptions,
      hackathon_image: hackathonImage,
    };

    setSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/hackathon/host`, finalData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStep(s => s + 1);
      setTimeout(() => navigateto('/profileinfo'), 1800);
    } catch (error) {
      console.error("Hackathon submission failed:", error);
      setSubmitError(error.response?.data?.message || 'Failed to create hackathon. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = ['Core Details', 'Schedule & Rules', 'Judging Criteria', 'Add Judges', 'Banner & Review'];

  const StepIndicator = useMemo(() => (
    <div className="flex items-center justify-center mb-10">
      {steps.map((label, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center w-28">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 ${step > index + 1 ? 'df-btn-primary !p-0' : step === index + 1 ? 'bg-white text-black' : 'bg-white/10 text-gray-400'}`}>
              {step > index + 1 ? <CheckCircle className="w-5 h-5 text-white" /> : <span className="font-bold text-sm">{index + 1}</span>}
            </div>
            <p className={`mt-2 text-xs text-center ${step >= index + 1 ? 'text-gray-200' : 'text-gray-500'}`}>{label}</p>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-auto border-t-2 transition-colors duration-500 mx-2 ${step > index + 1 ? 'border-indigo-500' : 'border-white/10'}`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [step]);

  return (
    <div className="df-page df-glow-bg flex items-center justify-center p-4 py-16">
      <div className="w-full max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white">
            Create a New Hackathon
          </h1>
          <p className="mt-3 text-gray-400">Host Registration Portal</p>
        </header>

        <main className="df-card p-8 sm:p-12">
          {step <= steps.length && StepIndicator}

          <form onSubmit={handleSubmit} noValidate>
            {step === 1 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-8 text-center">Step 1: Core Details</h2>
                <div className="space-y-6">
                  <FormInput id="hackathon_name" name="hackathon_name" type="text" placeholder="My Awesome Hackathon" value={formData.hackathon_name} onChange={handleChange} error={errors.hackathon_name} />
                  <FormSelect id="genre" name="genre" value={formData.genre} onChange={handleChange} error={errors.genre}>
                    <option value="" disabled className="bg-[#0d0d1a]">Select a genre...</option>
                    <option className="bg-[#0d0d1a]" value="Online">Online</option>
                    <option className="bg-[#0d0d1a]" value="In-Person (University)">In-Person (University)</option>
                    <option className="bg-[#0d0d1a]" value="In-Person (Corporate)">In-Person (Corporate)</option>
                    <option className="bg-[#0d0d1a]" value="In-Person (Community)">In-Person (Community)</option>
                    <option className="bg-[#0d0d1a]" value="Hybrid">Hybrid</option>
                    <option className="bg-[#0d0d1a]" value="Web Development">Web Development</option>
                    <option className="bg-[#0d0d1a]" value="Game Development">Game Development</option>
                    <option className="bg-[#0d0d1a]" value="Data Science">Data Science</option>
                  </FormSelect>
                </div>
              </section>
            )}

            {step === 2 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-8 text-center">Step 2: Schedule & Rules</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormInput id="starting_date" name="starting_date" type="datetime-local" value={formData.starting_date} onChange={handleChange} error={errors.starting_date} />
                    <FormInput id="ending_date" name="ending_date" type="datetime-local" value={formData.ending_date} onChange={handleChange} error={errors.ending_date} />
                  </div>
                  <FormInput id="duration" name="duration" type="text" placeholder="e.g., 48 Hours, 3 Days" value={formData.duration} onChange={handleChange} error={errors.duration} />
                  <FormInput id="rule_book" name="rule_book" type="url" placeholder="https://link-to-your/rulebook.pdf" value={formData.rule_book} onChange={handleChange} error={errors.rule_book} />
                </div>
              </section>
            )}

            {step === 3 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-8 text-center">Step 3: Judging Criteria</h2>
                <div className="space-y-4">
                  {formData.criteria.map((criterion, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-grow">
                        <FormInput
                          id={`criterion-desc-${index}`}
                          name="description"
                          type="text"
                          placeholder={`Criterion ${index + 1} description`}
                          value={criterion.description}
                          onChange={(e) => handleCriteriaChange(index, e)}
                          error={errors.criteria?.[index]?.description}
                        />
                      </div>
                      {formData.criteria.length > 1 && (
                        <button type="button" onClick={() => removeCriterion(index)} className="p-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addCriterion} className="mt-6 w-full df-btn-secondary">
                  <Shapes size={16} /> Add Another Criterion
                </button>
              </section>
            )}

            {step === 4 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-8 text-center">Step 4: Add Judges</h2>
                <div className="space-y-4">
                  {formData.judges.map((judge, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-grow">
                        <FormInput
                          id={`judge-username-${index}`}
                          name="username"
                          type="text"
                          placeholder={`Judge ${index + 1} username`}
                          value={judge.username}
                          onChange={(e) => handleJudgeChange(index, e)}
                          error={errors.judges?.[index]?.username}
                        />
                      </div>
                      {formData.judges.length > 1 && (
                        <button type="button" onClick={() => removeJudge(index)} className="p-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addJudge} className="mt-6 w-full df-btn-secondary">
                  <Users size={16} /> Add Another Judge
                </button>
              </section>
            )}

            {step === 5 && (
              <section>
                <h2 className="text-xl font-bold text-white mb-8 text-center">Step 5: Banner & Review</h2>
                <div className="space-y-8">
                  <div>
                    <label htmlFor="hackathon-image-upload" className="block text-sm font-medium text-gray-300 mb-2">Hackathon banner image (optional)</label>
                    <input id="hackathon-image-upload" name="hackathon_image" type="file" className="hidden" onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" />
                    <label htmlFor="hackathon-image-upload" className="cursor-pointer flex items-center justify-center gap-2 w-full df-btn-secondary">
                      <ImageIcon size={16} />
                      {uploading ? 'Uploading...' : hackathonImage ? 'Change image' : 'Upload an image'}
                    </label>
                    {errors.image && <p className="text-red-400 text-xs mt-1.5">{errors.image}</p>}
                    {imagePreview && (
                      <div className="mt-4">
                        <img src={imagePreview} alt="Banner preview" className="w-full h-auto rounded-lg object-cover max-h-56" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 bg-white/5 border border-white/10 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-2">Review your details</h3>
                    {[
                      ['Hackathon name', formData.hackathon_name],
                      ['Genre', formData.genre],
                      ['Starting date', formData.starting_date],
                      ['Ending date', formData.ending_date],
                      ['Duration', formData.duration],
                      ['Rule book', formData.rule_book],
                    ].map(([label, value]) => (
                      <div key={label} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-white/10 last:border-b-0">
                        <span className="text-gray-400">{label}</span>
                        <span className="text-white font-medium text-left sm:text-right break-all">{value || 'N/A'}</span>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-white/10">
                      <h3 className="text-gray-400 mb-2 text-sm uppercase tracking-wide">Judging Criteria</h3>
                      <div className="space-y-2">
                        {formData.criteria.map((c, i) => (
                          <div key={i} className="text-sm p-2.5 bg-white/5 rounded-md text-gray-200">{c.description || 'Unnamed criterion'}</div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/10">
                      <h3 className="text-gray-400 mb-2 text-sm uppercase tracking-wide">Judges</h3>
                      <div className="space-y-2">
                        {formData.judges.map((j, i) => (
                          <div key={i} className="text-sm p-2.5 bg-white/5 rounded-md text-gray-200">{j.username || 'Unnamed judge'}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {submitError && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3">
                      {submitError}
                    </div>
                  )}
                </div>
              </section>
            )}

            {step === 6 && (
              <section className="text-center py-10">
                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white">Hackathon created!</h2>
                <p className="text-gray-400 mt-2">Redirecting you now...</p>
              </section>
            )}

            {step < 6 && (
              <div className="mt-12 flex justify-between items-center">
                {step > 1 ? (
                  <button type="button" onClick={prevStep} className="df-btn-secondary">
                    <ArrowLeft size={16} /> Back
                  </button>
                ) : <div></div>}

                {step < steps.length && (
                  <button type="button" onClick={nextStep} className="df-btn-primary">
                    Next <ArrowRight size={16} />
                  </button>
                )}

                {step === steps.length && (
                  <button type="submit" disabled={submitting} className="df-btn-primary">
                    {submitting ? 'Submitting...' : 'Confirm & Submit'} <CheckCircle size={16} />
                  </button>
                )}
              </div>
            )}
          </form>
        </main>
      </div>
    </div>
  );
}
