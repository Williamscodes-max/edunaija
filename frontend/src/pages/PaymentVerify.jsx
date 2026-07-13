import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';

const PaymentVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference');
      const courseId = searchParams.get('course_id');

      if (!reference || !courseId) {
        toast.error('Invalid payment information.');
        navigate('/courses');
        return;
      }

      try {
        await api.post('/courses/payment/verify/', {
          reference,
          course_id: courseId,
        });

        toast.success('🎉 Payment successful! You have been enrolled.');
        navigate('/dashboard');
      } catch (error) {
        console.error(error);
        toast.error('Payment verification failed.');
        navigate('/courses');
      }
    };

    verifyPayment();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="text-2xl font-bold mb-2">
          Verifying Payment...
        </h2>
        <p className="text-gray-500">
          Please wait while we confirm your payment.
        </p>
      </div>
    </div>
  );
};

export default PaymentVerify;