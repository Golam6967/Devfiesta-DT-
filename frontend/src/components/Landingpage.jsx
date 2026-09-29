import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLongArrowAltRight } from "react-icons/fa";
import { Globe, Search } from "lucide-react";
import { useHackathons } from "../hooks/HackathonContext";

const getHackathonStatus = (startDateStr, endDateStr) => {
  const now = new Date();
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (now > end)
    return { text: "Ended", classes: "bg-red-500/15 text-red-300" };
  if (now >= start && now <= end)
    return { text: "Running", classes: "bg-emerald-500/15 text-emerald-300" };
  const daysLeft = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
  return {
    text: `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`,
    classes: "bg-indigo-500/15 text-indigo-300",
  };
};

const HackathonCard = ({ info }) => {
  const navigateto = useNavigate();
  const status = getHackathonStatus(info.starting_date, info.ending_date);

  return (
    <div
      onClick={() =>
        navigateto("/viewhackathon", { state: { hackathon: info } })
      }
      className="df-card overflow-hidden hover:border-white/20 hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div className="h-36 w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
        {info.hackathon_image ? (
          <img
            src={info.hackathon_image}
            alt={`${info.hackathon_name} banner`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-5xl font-display font-extrabold text-white/30">
            {info.hackathon_name.charAt(0)}
          </span>
        )}
        <span className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
          <Globe size={12} />
          {info.genre}
        </span>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-3">
          {info.hackathon_name}
        </h3>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span
            className={`${status.classes} font-semibold px-3 py-1 rounded-full`}
          >
            {status.text}
          </span>
          <span className="text-gray-500">
            {info.starting_date?.split("T")[0]} -{" "}
            {info.ending_date?.split("T")[0]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const [search, setsearch] = useState("");
  const { loading, hackathons } = useHackathons();
  const [showhackathon, sethackathon] = useState([]);
  const navigateto = useNavigate();

  useEffect(() => {
    if (loading || !hackathons) return;
    if (search.trim() === "") {
      sethackathon(hackathons);
    } else {
      sethackathon(
        hackathons.filter((h) =>
          h.hackathon_name.toLowerCase().includes(search.toLowerCase()),
        ),
      );
    }
  }, [search, loading, hackathons]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigateto(
      search.trim()
        ? `/hackathons?q=${encodeURIComponent(search.trim())}`
        : "/hackathons",
    );
  };

  if (loading) {
    return (
      <div className="df-page df-glow-bg flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="df-page df-glow-bg">
      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight">
          Build. Compete. <span className="df-text-gradient">Showcase.</span>
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-lg text-gray-400">
          DevFiesta brings hackathons, project showcases, and project-based
          learning together in one platform for developers, hosts, and judges.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigateto("/hostingpage")}
            className="df-btn-primary"
          >
            For Organizers
            <FaLongArrowAltRight size={18} />
          </button>
          <button
            onClick={() => navigateto("/hackathons")}
            className="df-btn-secondary"
          >
            For Participants
            <FaLongArrowAltRight size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="mt-12 max-w-xl mx-auto relative"
        >
          <input
            type="search"
            placeholder="Find your next hackathon"
            value={search}
            onChange={(e) => setsearch(e.target.value)}
            className="df-input pl-12 pr-28 h-14 text-base"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 df-btn-primary !py-2 !px-5 text-sm"
          >
            Search
          </button>
        </form>
      </section>

      <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <h2 className="font-display font-bold text-2xl text-white mb-6">
          Featured hackathons
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {showhackathon.length > 0 ? (
            showhackathon
              .slice(0, 6)
              .map((info) => (
                <HackathonCard key={info.hackathon_id} info={info} />
              ))
          ) : (
            <p className="text-gray-500 col-span-full text-center py-12">
              No hackathons to show yet.
            </p>
          )}
        </div>
      </section>

      <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="font-display font-bold text-white">DevFiesta</h3>
            <p className="text-sm text-gray-500 mt-1">
              Connect, build, evaluate.
            </p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm text-gray-400">
            <a
              onClick={() => navigateto("/hackathons")}
              className="hover:text-white cursor-pointer"
            >
              Browse hackathons
            </a>
            <a
              onClick={() => navigateto("/projects")}
              className="hover:text-white cursor-pointer"
            >
              Explore projects
            </a>
            <a
              onClick={() => navigateto("/hostingpage")}
              className="hover:text-white cursor-pointer"
            >
              Host a hackathon
            </a>
          </nav>
        </div>
        <p className="text-center text-xs text-gray-600 mt-8">
          © {new Date().getFullYear()} DevFiesta. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
