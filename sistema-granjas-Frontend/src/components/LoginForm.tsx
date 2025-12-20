// src/components/LoginForm.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginAPI } from "../api/auth";
import { useAuth } from "../hooks/useAuth"; // IMPORTANTE: Importar useAuth
import GoogleLoginButton from "./GoogleLoginButtom";

interface Props {
  onSwitch: () => void;
}

export default function LoginForm({ onSwitch }: Props) {
  const navigate = useNavigate();
  const { login } = useAuth(); // Obtener función login del contexto
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔄 Iniciando login...');

      // 1. Llamar al API de login
      const data = await loginAPI(email, password);

      console.log('✅ Respuesta del servidor recibida');

      // 2. Actualizar el contexto de autenticación (esto actualiza el estado de React)
      login(data.access_token);

      console.log('✅ Contexto actualizado, redirigiendo...');

      // 3. Mostrar mensaje de bienvenida
      alert(`Bienvenido, ${data.nombre}`);

      // 4. Navegar al dashboard (opcional, App.tsx ya redirige automáticamente)
      navigate("/dashboard");

    } catch (err: any) {
      console.error('❌ Error en login:', err);
      alert(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5 animate-fadeIn">
      <div>
        <label className="block font-medium text-gray-700 mb-2">
          Correo electrónico
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:border-green-700 focus:ring-green-700"
        />
      </div>

      <div>
        <label className="block font-medium text-gray-700 mb-2">
          Contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:border-green-700 focus:ring-green-700"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-green-700 py-2 font-medium text-white hover:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Ingresando..." : "Iniciar Sesión"}
      </button>

      {/* Google Login - SOLO para usuarios registrados */}
      <div className="mt-4">
        <p className="text-center text-gray-600 mb-2">o inicia sesión con</p>
        <GoogleLoginButton />
      </div>

      <p className="text-center text-sm text-gray-600 mt-4">
        ¿No tienes cuenta?{" "}
        <span
          onClick={onSwitch}
          className="cursor-pointer text-green-700 font-semibold hover:underline"
        >
          Regístrate aquí (solo formulario)
        </span>
      </p>
    </form>
  );
}