import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ReadRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const last = localStorage.getItem('lastReadPage');
    const page = last ? parseInt(last, 10) : 1;
    const safe = page >= 1 && page <= 604 ? page : 1;
    navigate(`/read/${safe}`, { replace: true });
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
    </div>
  );
};

export default ReadRedirect;
