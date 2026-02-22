import { useNavigate } from 'react-router-dom';
import { InquiryForm } from '../components/inquiries/InquiryForm';
import { useCreateInquiry } from '../hooks/useInquiries';

export default function NewInquiry() {
  const navigate = useNavigate();
  const { mutate: createInquiry, isPending } = useCreateInquiry();

  const handleSubmit = (data) => {
    createInquiry(data, {
      onSuccess: (inquiry) => navigate('/inquiries'),
    });
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-text-primary text-xl font-bold">New Inquiry</h2>
        <p className="text-text-muted text-sm mt-1">Fill in the inquiry details. A reference number will be auto-generated.</p>
      </div>
      <InquiryForm onSubmit={handleSubmit} isLoading={isPending} submitLabel="Create Inquiry" />
    </div>
  );
}
