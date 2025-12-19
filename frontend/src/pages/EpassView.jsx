import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import EpassCard from "../components/visitor/EpassCard";

const EpassView = () => {
  const { id } = useParams(); // epass id
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/visitor/epass/${id}`);
        setRegistration(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!registration) return <div className="p-6">Not found</div>;

  const { visitor_name, visitor_email, visitor_mobile, epass_id, epass_pdf, invite_code } = registration;
  const epassId = epass_id || invite_code || id; // fallback
  const link = `${window.location.origin}/epass/${epassId}`;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
      <EpassCard registration={registration} />
    </div>
  );
};

export default EpassView;
