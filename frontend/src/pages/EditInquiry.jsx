import { useParams, useNavigate } from 'react-router-dom';
import { InquiryForm } from '../components/inquiries/InquiryForm';
import { useInquiry, useUpdateInquiry } from '../hooks/useInquiries';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

export default function EditInquiry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: inquiry, isLoading } = useInquiry(id);
  const { mutate: updateInquiry, isPending } = useUpdateInquiry(id);

  const handleSubmit = (data) => {
    updateInquiry(data, {
      onSuccess: () => navigate('/inquiries'),
    });
  };

  if (isLoading) return <LoadingSkeleton rows={10} />;
  if (!inquiry) return <p className="text-text-muted">Inquiry not found</p>;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-text-primary text-xl font-bold">Edit Inquiry</h2>
        <p className="text-text-muted text-sm font-mono mt-1">{inquiry.ref_no}</p>
      </div>
      <InquiryForm
        initialData={inquiry}
        onSubmit={handleSubmit}
        isLoading={isPending}
        submitLabel="Update Inquiry"
      />
    </div>
  );
}
