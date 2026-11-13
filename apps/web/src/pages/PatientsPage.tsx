import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import type { Patient } from '@clinicflow/shared';
import { useDeletePatient, usePatientsList } from '../api/hooks.js';
import { RoleGate } from '../auth/AuthContext.js';
import { PatientFormDialog } from '../components/PatientFormDialog.js';
import { Dialog } from '../components/ui/Dialog.js';
import { Pagination } from '../components/ui/Pagination.js';
import { formatDateFr, getErrorMessage } from '../lib/utils.js';

export function PatientsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const patientsQuery = usePatientsList({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
  });

  const deleteMutation = useDeletePatient();

  async function confirmDelete() {
    if (!deletingPatient) return;
    try {
      await deleteMutation.mutateAsync(deletingPatient.id);
      toast.success(`Patient ${deletingPatient.fullName} supprimé`);
      setDeletingPatient(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Impossible de supprimer ce patient'));
    }
  }

  const patients = patientsQuery.data?.data ?? [];
  const meta = patientsQuery.data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Patients</h1>
          <p className="mt-1 text-sm text-slate-600">
            Recherchez, ajoutez ou modifiez les dossiers patients de la clinique.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingPatient(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nouveau patient
        </button>
      </div>

      {/* Search bar */}
      <search className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <label htmlFor="patients-search" className="block text-xs font-medium text-slate-600">
          Rechercher par nom complet ou numéro de CIN
        </label>
        <div className="relative mt-1.5">
          <Search
            className="pointer-events-none absolute top-2.5 left-3.5 h-4 w-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="patients-search"
            name="search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Ex. Alaoui, AB123456…"
            className="block w-full rounded-xl border border-slate-300 py-2 pr-4 pl-10 text-sm text-slate-900 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 focus:outline-none"
          />
        </div>
      </search>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        {patientsQuery.isLoading ? (
          <div className="p-10 text-center text-sm text-slate-500">Chargement des patients…</div>
        ) : patients.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Aucun patient ne correspond à votre recherche.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3.5">Nom complet</th>
                  <th className="px-6 py-3.5">CIN</th>
                  <th className="px-6 py-3.5">Téléphone</th>
                  <th className="px-6 py-3.5">Date de naissance</th>
                  <th className="px-6 py-3.5">Créé le</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/75">
                    <td className="px-6 py-4 font-semibold whitespace-nowrap text-slate-900">
                      <Link
                        to={`/patients/${patient.id}`}
                        className="hover:text-teal-700 hover:underline"
                      >
                        {patient.fullName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700">
                        {patient.cin}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700">{patient.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                      {formatDateFr(patient.birthDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      {formatDateFr(patient.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to={`/patients/${patient.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                          Détails
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPatient(patient);
                            setFormOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          Modifier
                        </button>
                        <RoleGate allow="admin">
                          <button
                            type="button"
                            onClick={() => setDeletingPatient(patient)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50/60 px-2.5 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Supprimer
                          </button>
                        </RoleGate>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta ? <Pagination meta={meta} onPageChange={setPage} /> : null}
      </div>

      <PatientFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        patient={editingPatient}
      />

      <Dialog
        open={Boolean(deletingPatient)}
        onClose={() => setDeletingPatient(null)}
        title="Confirmer la suppression"
        description={
          deletingPatient
            ? `Voulez-vous vraiment supprimer le dossier de ${deletingPatient.fullName} (${deletingPatient.cin}) ? Ses rendez-vous associés seront également supprimés.`
            : undefined
        }
      >
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            autoFocus
            onClick={() => setDeletingPatient(null)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={deleteMutation.isPending}
            onClick={() => void confirmDelete()}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-rose-700 disabled:opacity-60"
          >
            {deleteMutation.isPending ? 'Suppression…' : 'Supprimer définitivement'}
          </button>
        </div>
      </Dialog>
    </div>
  );
}
