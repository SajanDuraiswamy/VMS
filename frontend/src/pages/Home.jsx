import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold mb-4">Visitor Management System</h1>
      <p className="mb-8 text-gray-600">Welcome! Please choose how you’d like to continue.</p>
      <div className="space-x-4">
        <Link to="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg">Login</Link>
        <Link to="/register" className="bg-green-600 text-white px-6 py-3 rounded-lg">Register</Link>
      </div>
    </div>
  );
}
