import React, { useEffect, useState } from 'react';
import {
  Wrench,
  Radio,
  Zap,
  SlidersHorizontal,
  ArrowRight,
  Shield,
  Lock,
  CheckCircle2,
  FileText,
  AlertTriangle,
  TrainTrack,
  Clock,
  UserCheck,
  Database,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Phone,
  Building2,
  Info,
  ChevronRight,
  ShieldAlert,
  Flame,
  Check,
  X,
  Layers,
  Train
} from 'lucide-react';
import { OFFICIAL_ROLES } from '../data/mockData';
import { User, UserRole, SupabaseSyncState } from '../types';
import { fetchProfilesFromSupabase, SUPABASE_URL, JUDGE_DEMO_CREDENTIALS } from '../lib/supabase';
import { DepartmentLoginModal } from './DepartmentLoginModal';

interface LoginPortalProps {
  onLoginSuccess: (user: User) => void;
  onSelectRole?: (role: UserRole, dynamicUser?: User) => void;
  onOpenDbStatusModal?: () => void;
  supabaseState?: SupabaseSyncState;
}

interface SafetyCircular {
  id: string;
  circularNo: string;
  date: string;
  title: string;
  category: 'SAFETY' | 'TRACTION' | 'OPERATING' | 'SIGNALLING';
  department: string;
  summary: string;
  details: string[];
  mandatoryAction: string;
}

const SAFETY_CIRCULARS: SafetyCircular[] = [
  {
    id: 'circ-1',
    circularNo: '2026/RB/SAFETY/04',
    date: '15-FEB-2026',
    title: 'Mandatory Pre-Block Joint Inspection (P-Way & S&T)',
    category: 'SAFETY',
    department: 'Railway Board • Safety Directorate',
    summary:
      'Compulsory physical inspection of track points, track circuits, and fouling marks before applying for automatic corridor block sanction.',
    details: [
      'Site Engineers (P-Way) and Signal Inspectors must jointly verify point clip locking.',
      'Disconnection memo must be digitally exchanged and recorded in RAKSHA-BLOCK.',
      'No line clear shall be granted by Section Controller without dual-signature clearance.',
    ],
    mandatoryAction: 'Verify dual clearance memo before Line Clear authorization.',
  },
  {
    id: 'circ-2',
    circularNo: '2026/NR/TRD/OHE-PTW-11',
    date: '02-FEB-2026',
    title: '25kV AC Traction Power Shut-Down Protocol & PTW Guidelines',
    category: 'TRACTION',
    department: 'Electrical (TRD)',
    summary:
      'Rigorous Permit to Work (PTW) checklist and discharge rod bonding for maintenance within 2.0 meters of 25kV OHE live equipment.',
    details: [
      'Power block must be confirmed isolated by TPC (Traction Power Controller) before work starts.',
      'Two discharge earthing rods must be affixed on either side of the work site.',
      'Induction voltage monitoring mandatory for parallel 25kV / 2x25kV feeder lines.',
    ],
    mandatoryAction: 'Digital PTW issuance required for all heavy machinery operations.',
  },
  {
    id: 'circ-3',
    circularNo: '2026/DLI/OPTG/CORR-08',
    date: '10-JAN-2026',
    title: 'Automated Corridor Bundling Protocol under GR & SR Rule 4.12',
    category: 'OPERATING',
    department: 'Delhi Division • DOM Office',
    summary:
      'AI CP-SAT solver synchronization guidelines to combine Engineering, S&T, and TRD requests into shadow maintenance corridors.',
    details: [
      'Target maximum 180-minute window for high-density Delhi-Ghaziabad-Aligarh route.',
      'Freight rake staging on loop lines must be scheduled 45 minutes prior to block inception.',
      'Automatic TSR (Temporary Speed Restriction) caution orders published immediately upon block approval.',
    ],
    mandatoryAction: 'CP-SAT optimization must be reviewed by Section Controller prior to sanction.',
  },
  {
    id: 'circ-4',
    circularNo: '2026/RB/SIG/SIL4-AUTO',
    date: '28-DEC-2025',
    title: 'Safety Integrity Level (SIL-4) Virtual Protection in Section Control',
    category: 'SIGNALLING',
    department: 'Railway Board • S&T Directorate',
    summary:
      'Enforcement of SIL-4 virtual interlocking logic preventing accidental train diversion into sanctioned block sections.',
    details: [
      'Electronic Interlocking (EI) software interface synchronizes directly with RAKSHA-BLOCK.',
      'Axle counters maintain red aspect protection until safety return memo is filed.',
      'Line clear token generation locked until Site Engineer submits track restoration form.',
    ],
    mandatoryAction: 'SIL-4 interlocking validation logged in immutable audit records.',
  },
];

export const LoginPortal: React.FC<LoginPortalProps> = ({
  onLoginSuccess,
  onSelectRole,
  onOpenDbStatusModal,
  supabaseState,
}) => {
  const [profiles, setProfiles] = useState<Record<UserRole, User>>({
    ENG_OFFICER: OFFICIAL_ROLES.ENG_OFFICER,
    ST_OFFICER: OFFICIAL_ROLES.ST_OFFICER,
    TRD_OFFICER: OFFICIAL_ROLES.TRD_OFFICER,
    SECTION_CONTROLLER: OFFICIAL_ROLES.SECTION_CONTROLLER,
  });
  const [isLoadingProfiles, setIsLoadingProfiles] = useState<boolean>(true);
  const [isFromSupabase, setIsFromSupabase] = useState<boolean>(false);

  // Department Login Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedModalRole, setSelectedModalRole] = useState<UserRole>('ENG_OFFICER');

  // Selected Safety Circular Modal State
  const [activeCircular, setActiveCircular] = useState<SafetyCircular | null>(null);

  const handleOpenLoginModal = (role: UserRole) => {
    setSelectedModalRole(role);
    setIsModalOpen(true);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadDynamicProfiles() {
      try {
        const res = await fetchProfilesFromSupabase();
        if (isMounted && res.profiles && res.profiles.length > 0) {
          const profileMap = { ...profiles };
          res.profiles.forEach((p) => {
            if (p.role in profileMap) {
              profileMap[p.role as UserRole] = p;
            }
          });
          setProfiles(profileMap);
          setIsFromSupabase(res.fromSupabase);
        }
      } catch (err) {
        console.warn('Could not query Supabase profiles:', err);
      } finally {
        if (isMounted) setIsLoadingProfiles(false);
      }
    }

    loadDynamicProfiles();

    return () => {
      isMounted = false;
    };
  }, []);

  const rolesList: {
    role: UserRole;
    user: User;
    hindiTitle: string;
    title: string;
    subtitle: string;
    designationFull: string;
    serviceId: string;
    icon: React.ReactNode;
    colorClasses: {
      cardBorder: string;
      headerBg: string;
      badgeBg: string;
      badgeText: string;
      accentBg: string;
      buttonBg: string;
      iconBg: string;
      iconColor: string;
      hoverGlow: string;
    };
    scopeTag: string;
    permissions: string[];
    sampleTasks: string[];
    credentialsHint: { id: string; pass: string };
  }[] = [
    {
      role: 'ENG_OFFICER',
      user: profiles.ENG_OFFICER,
      hindiTitle: 'इंजीनियरिंग विभाग (पी-वे)',
      title: 'Engineering Department (P-Way)',
      subtitle: 'Permanent Way, Track Renewal & Heavy Earthworks',
      designationFull: 'Sr. DEN (Delhi Division)',
      serviceId: 'EMP-ENG-8821',
      icon: <Wrench className="w-6 h-6 text-blue-800" />,
      colorClasses: {
        cardBorder: 'border-blue-300 hover:border-blue-500',
        headerBg: 'bg-gradient-to-r from-blue-900 via-blue-800 to-blue-950 text-white',
        badgeBg: 'bg-blue-50 border-blue-300',
        badgeText: 'text-blue-900 font-bold',
        accentBg: 'bg-blue-50/70',
        buttonBg: 'bg-gradient-to-r from-[#000075] to-blue-900 hover:from-blue-900 hover:to-[#00005a]',
        iconBg: 'bg-blue-100 border-blue-200',
        iconColor: 'text-blue-800',
        hoverGlow: 'hover:shadow-blue-900/10',
      },
      scopeTag: 'DEPARTMENT ISOLATED',
      permissions: [
        'File track maintenance block requisitions (BCM, CSM, USFD)',
        'Isolated visibility: Engineering P-Way requisitions only',
        'Strictly ZERO Approval Authority (Railway Board Rule)',
      ],
      sampleTasks: ['BCM Deep Screening', 'CSM Track Tamping', 'USFD Rail Flaw Testing', 'Turnout Renewal'],
      credentialsHint: { id: 'ENG_OFFICER', pass: 'ENG@1234' },
    },
    {
      role: 'ST_OFFICER',
      user: profiles.ST_OFFICER,
      hindiTitle: 'सिग्नल एवं दूरसंचार विभाग',
      title: 'S&T (Signalling & Telecom)',
      subtitle: 'Electronic Interlocking, Point Machines & Track Circuits',
      designationFull: 'Sr. DSTE / Signalling (Delhi Division)',
      serviceId: 'EMP-ST-4419',
      icon: <Radio className="w-6 h-6 text-emerald-800" />,
      colorClasses: {
        cardBorder: 'border-emerald-300 hover:border-emerald-500',
        headerBg: 'bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white',
        badgeBg: 'bg-emerald-50 border-emerald-300',
        badgeText: 'text-emerald-900 font-bold',
        accentBg: 'bg-emerald-50/70',
        buttonBg: 'bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-900 hover:to-emerald-950',
        iconBg: 'bg-emerald-100 border-emerald-200',
        iconColor: 'text-emerald-800',
        hoverGlow: 'hover:shadow-emerald-900/10',
      },
      scopeTag: 'DEPARTMENT ISOLATED',
      permissions: [
        'Submit interlocking, point overhaul & axle counter requisitions',
        'Isolated visibility: S&T Department records only',
        'Strictly ZERO Approval Authority (Railway Board Rule)',
      ],
      sampleTasks: ['Point Machine Overhaul', 'Axle Counter Tuning', 'Signal Aspect Calibration', 'EI Route Locking'],
      credentialsHint: { id: 'ST_OFFICER', pass: 'ST@1234' },
    },
    {
      role: 'TRD_OFFICER',
      user: profiles.TRD_OFFICER,
      hindiTitle: 'विद्युत कर्षण वितरण विभाग',
      title: 'TRD (Traction & 25kV OHE)',
      subtitle: '25kV Overhead Equipment, Sub-stations & Power Isolations',
      designationFull: 'DEE / TRD Traction (Delhi Division)',
      serviceId: 'EMP-TRD-9032',
      icon: <Zap className="w-6 h-6 text-amber-800" />,
      colorClasses: {
        cardBorder: 'border-amber-300 hover:border-amber-500',
        headerBg: 'bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white',
        badgeBg: 'bg-amber-50 border-amber-300',
        badgeText: 'text-amber-900 font-bold',
        accentBg: 'bg-amber-50/70',
        buttonBg: 'bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950',
        iconBg: 'bg-amber-100 border-amber-200',
        iconColor: 'text-amber-800',
        hoverGlow: 'hover:shadow-amber-900/10',
      },
      scopeTag: 'DEPARTMENT ISOLATED',
      permissions: [
        'Apply for 25kV AC OHE Power Block & PTW Clearances',
        'Isolated visibility: TRD Department records only',
        'Strictly ZERO Approval Authority (Railway Board Rule)',
      ],
      sampleTasks: ['25kV Power Block', 'Cantilever Washing', 'Neutral Section Check', 'Tower Wagon Run'],
      credentialsHint: { id: 'TRD_OFFICER', pass: 'TRD@1234' },
    },
    {
      role: 'SECTION_CONTROLLER',
      user: profiles.SECTION_CONTROLLER,
      hindiTitle: 'मुख्य नियंत्रण कक्ष (प्रशासक)',
      title: 'Main Control - Section Controller',
      subtitle: 'Traffic Operating (DOM Office) & Train Movement Authority',
      designationFull: 'Chief Controller / Operating (DOM Office, DLI)',
      serviceId: 'EMP-CTRL-001',
      icon: <SlidersHorizontal className="w-6 h-6 text-purple-900" />,
      colorClasses: {
        cardBorder: 'border-purple-300 hover:border-purple-500 ring-1 ring-purple-200',
        headerBg: 'bg-gradient-to-r from-purple-950 via-purple-900 to-[#00005a] text-white',
        badgeBg: 'bg-purple-100 border-purple-300',
        badgeText: 'text-purple-950 font-black',
        accentBg: 'bg-purple-50/70',
        buttonBg: 'bg-gradient-to-r from-purple-900 to-[#000075] hover:from-purple-950 hover:to-blue-950',
        iconBg: 'bg-purple-100 border-purple-200',
        iconColor: 'text-purple-950',
        hoverGlow: 'hover:shadow-purple-900/15',
      },
      scopeTag: 'ADMIN EXCLUSIVE AUTHORITY',
      permissions: [
        'Cross-department total visibility (Engineering, S&T, TRD)',
        'Exclusive authority: Approve, Time-Trim, or Reject requests',
        'AI CP-SAT Corridor Bundling & Caution Order Issuance',
      ],
      sampleTasks: ['Corridor Bundling Sanction', 'Caution Order Issuance', 'Punctuality Impact Matrix', 'Emergency Block Control'],
      credentialsHint: { id: 'MAIN_CONTROL', pass: 'ADMIN@1234' },
    },
  ];

  return (
    <div className="w-full bg-[#f4f6f9] text-slate-800 pb-12 select-none">
      {/* 1. Official IRCTC Hero Banner with Railway Blueprint & Track Motif */}
      <section
        id="irctc-hero-section"
        className="relative bg-gradient-to-b from-[#00005a] via-[#000075] to-[#001f54] text-white overflow-hidden border-b-4 border-amber-500 shadow-lg"
      >
        {/* Subtle Railway Vector Background Motif */}
        <div className="absolute inset-0 opacity-10 bg-railway-blueprint pointer-events-none" />
        <div className="absolute inset-0 bg-rail-tracks-pattern pointer-events-none" />

        <div className="relative max-w-[1800px] w-full mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-8 sm:pb-10">
          <div className="text-center max-w-4xl mx-auto space-y-3 sm:space-y-4">
            {/* Prominent Bilingual Heading */}
            <div>
              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-sm break-words">
                <span className="text-amber-400">रक्षा-ब्लॉक पोर्टल</span>
                <span className="mx-2 sm:mx-3 text-slate-300 font-light">|</span>
                <span>RAKSHA-BLOCK PORTAL</span>
              </h1>
              <p className="mt-2 text-xs sm:text-sm lg:text-base text-blue-100 max-w-3xl mx-auto leading-relaxed font-medium px-2">
                भारतीय रेल स्वचालित ब्लॉक नियोजन एवं गलियारा अनुरक्षण प्रणाली
                <span className="block text-slate-300 text-xs sm:text-sm font-normal mt-0.5">
                  AI-Powered Automatic Block Planning & Corridor Maintenance Management System
                </span>
              </p>
            </div>

            {/* Indian Railways Corridor Schematic Line Graphic */}
            <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-blue-800/80 max-w-4xl mx-auto">
              <div className="flex items-center justify-between text-[11px] font-mono text-blue-200 mb-1 px-2">
                <span className="flex items-center space-x-1 text-amber-300 font-bold">
                  <TrainTrack className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">DLI-GZB-ALJN QUADRUPLE CORRIDOR (SECTION-01)</span>
                </span>
                <span className="hidden sm:inline text-slate-300">Total Route: 126.1 KM • 160 KMPH FIT</span>
              </div>

              {/* Station Node Progress Track Line Graphic */}
              <div className="relative flex items-center justify-between bg-blue-950/70 border border-blue-800 rounded-lg p-2.5 sm:p-3 overflow-x-auto text-xs scrollbar-thin">
                {/* Station 1 */}
                <div className="flex flex-col items-center min-w-[70px] z-10">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-emerald-950 shadow-sm mb-1" />
                  <span className="font-bold text-white text-[11px]">NDLS</span>
                  <span className="text-[9px] text-slate-400 font-mono">0.0 KM</span>
                </div>

                <div className="flex-1 h-0.5 bg-emerald-500/80 mx-1 min-w-[30px] relative">
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] text-emerald-300 font-mono">UP LINE</span>
                </div>

                {/* Station 2 */}
                <div className="flex flex-col items-center min-w-[70px] z-10">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-emerald-950 shadow-sm mb-1" />
                  <span className="font-bold text-white text-[11px]">ANVT</span>
                  <span className="text-[9px] text-slate-400 font-mono">9.2 KM</span>
                </div>

                <div className="flex-1 h-0.5 bg-amber-500/80 mx-1 min-w-[30px] relative">
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] text-amber-300 font-mono">25kV OHE</span>
                </div>

                {/* Station 3 */}
                <div className="flex flex-col items-center min-w-[70px] z-10">
                  <span className="w-3 h-3 rounded-full bg-amber-400 ring-4 ring-amber-950 shadow-sm mb-1 animate-pulse" />
                  <span className="font-bold text-amber-300 text-[11px]">GZB JCN</span>
                  <span className="text-[9px] text-slate-400 font-mono">25.6 KM</span>
                </div>

                <div className="flex-1 h-0.5 bg-emerald-500/80 mx-1 min-w-[30px] relative">
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] text-emerald-300 font-mono">ABS OK</span>
                </div>

                {/* Station 4 */}
                <div className="flex flex-col items-center min-w-[70px] z-10">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-emerald-950 shadow-sm mb-1" />
                  <span className="font-bold text-white text-[11px]">MTC</span>
                  <span className="text-[9px] text-slate-400 font-mono">68.4 KM</span>
                </div>

                <div className="flex-1 h-0.5 bg-emerald-500/80 mx-1 min-w-[30px] relative">
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] text-emerald-300 font-mono">DN LINE</span>
                </div>

                {/* Station 5 */}
                <div className="flex flex-col items-center min-w-[70px] z-10">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-emerald-950 shadow-sm mb-1" />
                  <span className="font-bold text-white text-[11px]">ALJN JCN</span>
                  <span className="text-[9px] text-slate-400 font-mono">126.1 KM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Department Login Portal Cards (Grid of 4 with IRCTC / FOIS Aesthetics) */}
      <section id="department-login-cards-grid" className="max-w-[1800px] w-full mx-auto px-3 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-5">
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#000075] uppercase tracking-wide flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-amber-500 shrink-0" />
              <span>विभागीय लॉगिन पोर्टल | Authorized Department Consoles</span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Select your department portal below. Role isolation and approval authorities are strictly validated by IR-RBAC Tier 1.
            </p>
          </div>
        </div>

        {/* 4 Distinct Department Cards: 4 columns on large laptops, 2 on medium, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {rolesList.map((item, idx) => (
            <div
              key={item.role}
              id={`login-card-${item.role.toLowerCase()}`}
              onClick={() => handleOpenLoginModal(item.role)}
              className={`bg-white rounded-xl border ${item.colorClasses.cardBorder} shadow-sm ${item.colorClasses.hoverGlow} hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden relative group cursor-pointer`}
            >
              {/* Card Official Department Header Ribbon */}
              <div className={`px-5 py-3.5 ${item.colorClasses.headerBg} flex items-center justify-between border-b`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-200">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-amber-300 tracking-wider">
                      {item.hindiTitle}
                    </div>
                    <h3 className="text-base font-extrabold text-white tracking-tight leading-snug">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/20 text-white uppercase tracking-wider">
                    {item.scopeTag}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                {/* Officer Credential Dossier Simulation */}
                <div className={`p-3.5 rounded-lg ${item.colorClasses.accentBg} border border-slate-200 text-xs`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm">{item.user.name}</div>
                      <div className="text-slate-600 text-xs mt-0.5">{item.designationFull}</div>
                    </div>
                    <div className="text-right text-[10px] text-slate-500">
                      {item.serviceId}
                    </div>
                  </div>
                </div>

                {/* Scope & Permissions List */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                    <span>IR-RBAC Scope & Authority</span>
                    <span className="text-[10px] font-mono text-slate-400">Security Rule #4.1</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {item.permissions.map((perm, pIdx) => (
                      <li key={pIdx} className="flex items-start space-x-2">
                        {pIdx === 2 && item.role !== 'SECTION_CONTROLLER' ? (
                          <Lock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span>{perm}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Maintenance Modules & Tasks */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Key Maintenance Modules:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.sampleTasks.map((task, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded border border-slate-200"
                      >
                        {task}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Official Action Button Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200">
                <button
                  id={`btn-login-${item.role.toLowerCase()}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenLoginModal(item.role);
                  }}
                  className={`w-full py-3 px-4 rounded-lg text-sm font-bold text-white ${item.colorClasses.buttonBg} shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer`}
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>लॉग इन करें / LOG IN TO PORTAL</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Railway Safety Circulars & Regulatory Bulletins (IRCTC / FOIS Aesthetic) */}
      <section id="railway-safety-circulars-section" className="max-w-[1800px] w-full mx-auto px-3 sm:px-6 lg:px-8 mt-8 sm:mt-10">
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
          {/* Section Header */}
          <div className="bg-[#000075] text-white px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-amber-500">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-blue-950 flex items-center justify-center font-black">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white tracking-wide">
                  रेलवे सुरक्षा परिपत्र एवं संचालन नियम | Railway Safety Circulars & Directives
                </h3>
                <p className="text-xs text-blue-200">
                  Published by Railway Board & CRS (Commissioner of Railway Safety)
                </p>
              </div>
            </div>

          </div>

          {/* Circulars List Grid */}
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {SAFETY_CIRCULARS.map((circ) => (
              <div
                key={circ.id}
                id={`circular-card-${circ.id}`}
                onClick={() => setActiveCircular(circ)}
                className="p-4 rounded-lg bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-end text-xs mb-1.5">
                    <span className="text-slate-500 text-[11px] font-medium">{circ.date}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#000075] transition-colors leading-snug">
                    {circ.title}
                  </h4>

                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                    {circ.summary}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-medium">{circ.department}</span>
                  <span className="text-[#000075] font-bold flex items-center space-x-1 group-hover:underline">
                    <span>Read Mandate</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Official Indian Railways Helpline & Emergency Support Directory */}
      <section id="railway-helpline-directory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-slate-100 rounded-xl border border-slate-300 p-5 text-xs text-slate-700">
          <div className="flex items-center space-x-2 text-[#000075] font-bold text-sm mb-3">
            <Phone className="w-4 h-4 text-amber-600" />
            <span>आपातकालीन सहायता एवं नियंत्रण कक्ष निर्देशिका | Railway Helpline & Control Directory</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="font-bold text-slate-900 text-xs">Delhi Division Control Room</div>
              <div className="font-mono text-sm text-[#000075] font-bold mt-1">011-23340000</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Direct Railway Line: 51200</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="font-bold text-slate-900 text-xs">Emergency Railway Helpline</div>
              <div className="font-mono text-sm text-red-700 font-bold mt-1">139 (Toll Free)</div>
              <div className="text-[11px] text-slate-500 mt-0.5">24x7 Passenger & Security Support</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="font-bold text-slate-900 text-xs">FOIS / RAKSHA Support</div>
              <div className="font-mono text-xs text-blue-900 font-bold mt-1">fois-support@railnet.gov.in</div>
              <div className="text-[11px] text-slate-500 mt-0.5">CRIS Headquarters, Chanakyapuri</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="font-bold text-slate-900 text-xs">Safety Audit Directorate</div>
              <div className="font-mono text-xs text-emerald-800 font-bold mt-1">Indian Railways</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Baroda House, New Delhi 110001</div>
            </div>
          </div>
        </div>
      </section>

      {/* IRCTC-Styled Department Login Modal */}
      <DepartmentLoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedRole={selectedModalRole}
        onSelectRoleChange={setSelectedModalRole}
        onLoginSuccess={(authenticatedUser) => {
          setIsModalOpen(false);
          onLoginSuccess(authenticatedUser);
          if (onSelectRole) {
            onSelectRole(authenticatedUser.role, authenticatedUser);
          }
        }}
      />

      {/* Safety Circular Full View Modal */}
      {activeCircular && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setActiveCircular(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#000075] text-white p-5 border-b-4 border-amber-500 flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white">{activeCircular.title}</h3>
                <p className="text-xs text-blue-200 mt-0.5">{activeCircular.department} • {activeCircular.date}</p>
              </div>
              <button
                onClick={() => setActiveCircular(null)}
                className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700 max-h-[70vh] overflow-y-auto">
              <div>
                <div className="font-bold text-slate-900 mb-1">Executive Summary:</div>
                <p className="leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
                  {activeCircular.summary}
                </p>
              </div>

              <div>
                <div className="font-bold text-slate-900 mb-1.5">Mandatory Operational Instructions:</div>
                <ul className="space-y-1.5">
                  {activeCircular.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-700 mt-1.5 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900">
                <span className="font-bold block mb-0.5">Enforcement Policy:</span>
                <span>{activeCircular.mandatoryAction}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setActiveCircular(null)}
                className="px-4 py-2 bg-[#000075] text-white rounded-lg text-xs font-bold hover:bg-blue-900 transition-colors cursor-pointer"
              >
                Dismiss & Return to Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
