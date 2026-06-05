'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Etape4Souverainete() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('projectId');

  const [auditDone, setAuditDone] = useState(false);
  const [auditFile, setAuditFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadedAuditUrl, setUploadedAuditUrl] = useState<string | null>(null);

  useEffect(() => {
    async function checkAccess() {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user || !projectId) {
            router.push('/dashboard/projects');
            return;
          }
    
          // Vérifier si le projet appartient bien à l'utilisateur
          const { data: project, error } = await supabase
            .from('projects')
            .select('user_id')
            .eq('id', projectId)
            .single();
    
          if (error || !project || project.user_id !== user.id) {
            console.error("Accès non autorisé");
            router.push('/dashboard/projects');
          }
        }
        checkAccess();
    async function loadAuditState() {
      if (!projectId) return;
      const { data, error } = await supabase
        .from('projects')
        .select('audit_done, audit_upload_url')
        .eq('id', projectId)
        .single();

      if (error) {
        console.error('Erreur de chargement audit projet :', error.message);
        return;
      }

      if (data) {
        setAuditDone(!!data.audit_done);
        setUploadedAuditUrl(data.audit_upload_url || null);
      }
    }

    loadAuditState();
  }, [projectId, router]);

  const persistAuditState = async (payload: { audit_done?: boolean; audit_upload_url?: string | null }) => {
    if (!projectId) return;
    const { error } = await supabase
      .from('projects')
      .update(payload)
      .eq('id', projectId);

    if (error) {
      console.error('Erreur mise à jour projet audit :', error.message);
    }
  };

  const handleAuditUpload = async () => {
    if (!projectId) return;
    if (!auditFile) {
      setUploadStatus('Veuillez sélectionner un fichier d’audit à téléverser.');
      return;
    }

    setUploading(true);
    setUploadStatus('');

    const fileName = `${Date.now()}_${auditFile.name.replace(/\s+/g, '_')}`;
    const filePath = `audits/${projectId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('audits')
      .upload(filePath, auditFile, { upsert: true });

    if (uploadError) {
      setUploadStatus(`Erreur upload : ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('audits')
      .getPublicUrl(filePath);

    setUploadedAuditUrl(publicUrlData.publicUrl);
    setUploadStatus('Rapport d’audit téléversé avec succès.');
    await persistAuditState({ audit_done: true, audit_upload_url: publicUrlData.publicUrl });
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-slate-900">
      <div className="bg-white border-b sticky top-0 z-30 p-4">
        <div className="max-w-[1600px] mx-auto grid grid-cols-3 items-center">
          <div className="flex justify-start">
            <Link
              href={`/dashboard/etape-3?projectId=${projectId}`}
              className="flex items-center gap-3 px-6 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-100 group"
            >
              <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] uppercase opacity-80 tracking-tighter font-medium">Revenir à l&apos;</span>
                <span className="text-sm">Étape 3</span>
              </div>
            </Link>
          </div>

          <div className="flex flex-col items-center text-center">
            <h1 className="text-lg font-black text-slate-800 tracking-tight uppercase">Étape 4 : Accessibilité numérique</h1>
            <Link
              href="/dashboard/projects"
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Retour au dashboard
            </Link>
          </div>

          <div className="flex justify-end">
            <Link
              href={`/dashboard/etape-5?projectId=${projectId}`}
              className="flex items-center gap-3 px-6 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-100 group"
            >
              <div className="flex flex-col items-end leading-none">
                <span className="text-[10px] uppercase opacity-80 tracking-tighter font-medium">Passer à l&apos;</span>
                <span className="text-sm">Étape 5</span>
              </div>
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-violet-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden mb-12">
          <div className="relative z-10">
            <h2 className="text-2xl font-black uppercase italic mb-2 tracking-tight text-white">La conformité à l&apos;accessibilité</h2>
            <p className="text-violet-200 text-sm font-medium leading-relaxed max-w-xl">
              La mise en conformité de votre projet numérique au Référentiel Général d&apos;Amélioration de l&apos;Accessibilité (RGAA) est une obligation légale.
            </p>
            <p className="text-violet-200 text-sm font-medium leading-relaxed max-w-xl">Pour cela, voici quelques outils utiles vous permettant de réaliser vos audits d&apos;accessibilité numérique :</p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-violet-800 rounded-full opacity-50 blur-3xl"></div>
        </div>

        <div className="bg-white rounded-[1.5rem] shadow-md border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-violet-50 to-violet-100 border-b-2 border-violet-200">
                <th className="px-6 py-4 text-left text-sm font-black text-violet-900 uppercase tracking-tight">Type de ressources</th>
                <th className="px-6 py-4 text-left text-sm font-black text-violet-900 uppercase tracking-tight">Lien</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100 hover:bg-violet-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-700">Outils de création pour rendre l&apos;information et la communication accessibles</td>
                <td className="px-6 py-4 text-sm">
                  <a href="https://www.info.gouv.fr/accessibilite/outils-de-creation-pour-rendre-linformation-et-la-communication-accessibles" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-800 font-semibold underline underline-offset-2 hover:no-underline">https://www.info.gouv.fr/accessibilite/outils-de-creation-pour-rendre-linformation-et-la-communication-accessibles</a>
                </td>
              </tr>
              <tr className="border-b border-slate-100 hover:bg-violet-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-700">Outils de création pour rendre vos applications mobiles accessibles</td>
                <td className="px-6 py-4 text-sm space-y-2">
                  <div>
                    <a href="https://www.info.gouv.fr/accessibilite/applications-mobiles/guide-daudit-daccessibilite-des-applications-mobiles" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-800 font-semibold underline underline-offset-2 hover:no-underline block">https://www.info.gouv.fr/accessibilite/applications-mobiles/guide-daudit-daccessibilite-des-applications-mobiles</a>
                  </div>
                  <div>
                    <a href="https://accessibilityinsights.io/" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-800 font-semibold underline underline-offset-2 hover:no-underline block">https://accessibilityinsights.io/</a>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-violet-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-700">Outils de création pour rendre vos sites</td>
                <td className="px-6 py-4 text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <a href="https://ara.numerique.gouv.fr/" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-800 font-semibold underline underline-offset-2 hover:no-underline">https://ara.numerique.gouv.fr/</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href="https://kastor.green/" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-800 font-semibold underline underline-offset-2 hover:no-underline">https://kastor.green/</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href="https://my.tanaguru.com/#/external-module/Home" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-800 font-semibold underline underline-offset-2 hover:no-underline">https://my.tanaguru.com/#/external-module/Home</a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="max-w-3xl mx-auto p-8 mt-8 bg-white rounded-[1.5rem] shadow-md border border-slate-100">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">Audit d&apos;accessibilité</h2>
                <p className="text-sm text-slate-500">Cochez si l&apos;audit a été réalisé, puis téléversez le rapport sur le site.</p>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={auditDone}
                  onChange={async (e) => {
                    const nextValue = e.target.checked;
                    setAuditDone(nextValue);
                    await persistAuditState({ audit_done: nextValue });
                  }}
                  className="w-5 h-5 accent-violet-600"
                />
                <span className="font-bold text-slate-700">Audit réalisé</span>
              </label>
            </div>

            {auditDone ? (
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">
                  Fichier d&apos;audit
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    onChange={(e) => setAuditFile(e.target.files?.[0] ?? null)}
                    className="mt-3 w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleAuditUpload}
                  disabled={!auditFile || uploading}
                  className="w-full max-w-xs bg-violet-600 text-white px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-violet-700 transition-all disabled:opacity-50"
                >
                  {uploading ? 'Téléversement...' : 'Téléverser le rapport'}
                </button>

                {uploadStatus && <p className="text-sm text-slate-600">{uploadStatus}</p>}
                {uploadedAuditUrl && (
                  <a href={uploadedAuditUrl} target="_blank" rel="noreferrer" className="text-violet-600 font-semibold underline">
                    Voir le rapport d&apos;audit
                  </a>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
