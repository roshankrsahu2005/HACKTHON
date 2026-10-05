import React, { useState } from 'react';
import { ArrowLeft, User, ShieldCheck, Check, Heart, Save, LogOut } from 'lucide-react';
import { ScreenId, PatientProfile } from '../../types';
import { INITIAL_PATIENT_PROFILE } from '../../data/mockData';
import { syncProfileToSupabase } from '../../utils/supabase';

interface ProfileScreenProps {
  onNavigate: (screen: ScreenId) => void;
  profile: PatientProfile;
  onSaveProfile: (profile: PatientProfile) => void;
  onLogout?: () => void;
}

const BLOOD_GROUPS = ['Select', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigate,
  profile,
  onSaveProfile,
  onLogout,
}) => {
  const [formData, setFormData] = useState<PatientProfile>(profile);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    syncProfileToSupabase(formData);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col justify-between h-full min-h-[640px] p-5 sm:p-8 bg-[#eef3fa] relative overflow-y-auto rounded-3xl">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('patient_translation')}
              className="w-10 h-10 -ml-2 rounded-2xl neu-button flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Patient Profile</h2>
              <p className="text-xs text-slate-500 font-medium">Manage medical info & authentication</p>
            </div>
          </div>

          {/* Logout Action Button in Profile */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3.5 py-2.5 rounded-2xl neu-button text-red-600 hover:bg-red-500 hover:text-white flex items-center gap-2 text-xs font-extrabold transition-all cursor-pointer shadow-xs"
              title="Lock / Sign Out of Portal"
            >
              <LogOut className="w-4 h-4 stroke-[2.4]" />
              <span>Sign Out</span>
            </button>
          )}
        </div>

        {/* Profile Card / Header Avatar */}
        <div className="p-5 neu-card rounded-3xl mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-15 h-15 rounded-2xl neu-pressed text-blue-600 flex items-center justify-center shrink-0">
              <User className="w-8 h-8 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {formData.name || 'Patient Profile'}
              </h3>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Encrypted & saved on device</span>
              </p>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="hidden sm:flex p-3 rounded-2xl neu-button text-red-600 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-5 h-5 stroke-[2.4]" />
            </button>
          )}
        </div>

        {/* Form Inputs */}
        <form id="profileForm" onSubmit={handleSubmit} className="space-y-3.5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter name"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 transition-colors shadow-2xs"
            />
          </div>

          {/* Age & Blood Group Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Age
              </label>
              <input
                type="text"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="Enter age"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 transition-colors shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Blood Group
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-blue-600 transition-colors shadow-2xs cursor-pointer"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg === 'Select' ? '' : bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Known Allergies */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Known Allergies
            </label>
            <input
              type="text"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder="E.g. Penicillin"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 transition-colors shadow-2xs"
            />
          </div>

          {/* Current Medicines */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Medicines
            </label>
            <input
              type="text"
              value={formData.currentMedicines}
              onChange={(e) => setFormData({ ...formData, currentMedicines: e.target.value })}
              placeholder="E.g. Diabetes, BP"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 transition-colors shadow-2xs"
            />
          </div>
        </form>

        {isSaved && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Profile successfully encrypted & saved offline!</span>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="pt-6">
        <button
          type="submit"
          form="profileForm"
          className="w-full h-13 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
        >
          {isSaved ? (
            <>
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>Saved Profile</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save Profile</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
