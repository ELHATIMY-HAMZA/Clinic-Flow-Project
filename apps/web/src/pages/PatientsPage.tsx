import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import type { Patient } from '@clinicflow/shared';
import { useDeletePatient, usePatientsList } from '../api/hooks.js';
import { RoleGate } from '../auth/AuthContext.js';
import { PatientFormDialog } from '../components/PatientFormDialog.js';
import { BorderGlow } from '../components/reactbits/BorderGlow.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { Dialog } from '../components/ui/Dialog.js';
import { Input, Label } from '../components/ui/Input.js';
import { Pagination } from '../components/ui/Pagination.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/Table.js';
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
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[12px] font-medium tracking-wide text-[#0d9488] uppercase">
            Répertoire clinique · Index trigrammes GIN
          </p>
          <h1 className="mt-1 text-[28px] leading-tight font-bold tracking-tight text-[#0c0f12] sm:text-[32px]">
            Dossiers patients.{' '}
            <span className="font-normal text-[#5a626a]">
              Recherchez par nom ou CIN et gérez les fiches.
            </span>
          </h1>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditingPatient(null);
            setFormOpen(true);
          }}
          withArrow
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nouveau patient
        </Button>
      </header>

      {/* Search Bar wrapped in ReactBits BorderGlow */}
      <search>
        <BorderGlow className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1">
              <Label htmlFor="patients-search">
                Recherche instantanée (nom complet ou numéro de CIN)
              </Label>
              <div className="relative mt-1.5">
                <Search
                  className="pointer-events-none absolute top-3.5 left-3.5 h-4 w-4 text-[#5a626a]"
                  aria-hidden="true"
                />
                <Input
                  id="patients-search"
                  name="search"
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Ex. Mohamed Alaoui, AB123456…"
                  className="pl-10"
                />
              </div>
            </div>
            {meta ? (
              <div className="flex items-center gap-2 pb-1">
                <Badge variant="default" className="font-mono">
                  {meta.total} dossier{meta.total > 1 ? 's' : ''}
                </Badge>
              </div>
            ) : null}
          </div>
        </BorderGlow>
      </search>

      {/* Patients Data Table wrapped in ReactBits BorderGlow */}
      <BorderGlow className="overflow-hidden p-0">
        {patientsQuery.isLoading ? (
          <div className="space-y-3 p-6">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center text-[15px] text-[#5a626a]">
            Aucun dossier patient ne correspond à votre recherche.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom complet</TableHead>
                <TableHead>N° CIN</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Date de naissance</TableHead>
                <TableHead>Enregistré le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-semibold whitespace-nowrap">
                    <Link
                      to={`/patients/${patient.id}`}
                      className="text-[#0c0f12] decoration-[#0c0f12]/30 underline-offset-4 hover:text-[#0d9488] hover:underline"
                    >
                      {patient.fullName}
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant="default" className="font-mono">
                      {patient.cin}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-[13px] whitespace-nowrap text-[#5a626a]">
                    {patient.phone}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-[#5a626a]">
                    {formatDateFr(patient.birthDate)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-[#5a626a]">
                    {formatDateFr(patient.createdAt)}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <Button variant="secondary" size="xs" asChild>
                        <Link to={`/patients/${patient.id}`}>
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                          Détails
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="xs"
                        onClick={() => {
                          setEditingPatient(patient);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        Modifier
                      </Button>
                      <RoleGate allow="admin">
                        <Button
                          type="button"
                          variant="destructiveOutline"
                          size="xs"
                          onClick={() => setDeletingPatient(patient)}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Supprimer
                        </Button>
                      </RoleGate>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {meta ? <Pagination meta={meta} onPageChange={setPage} /> : null}
      </BorderGlow>

      <PatientFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        patient={editingPatient}
      />

      <Dialog
        open={Boolean(deletingPatient)}
        onClose={() => setDeletingPatient(null)}
        title="Confirmer la suppression du dossier"
        description={
          deletingPatient
            ? `Voulez-vous vraiment supprimer le dossier de ${deletingPatient.fullName} (${deletingPatient.cin}) ? Ses rendez-vous associés seront également supprimés par cascade.`
            : undefined
        }
      >
        <div className="flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="secondary"
            autoFocus
            onClick={() => setDeletingPatient(null)}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={() => void confirmDelete()}
          >
            {deleteMutation.isPending ? 'Suppression…' : 'Supprimer définitivement'}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
