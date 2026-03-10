import {
  MapPin,
  Phone,
  Mail,
  Instagram
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-(--color-primary) text-white">
      <div className="max-w-7xl mx-auto px-8 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Marca */}
        <section className="space-y-4">
          <div className="flex items-center text-center gap-3">
            <img
              src="/white_icon.png"
              alt="Serve"
              className="w-10 h-10"
            />
            <h3 className="text-2xl font-semibold font-logo mt-2.5">Serve</h3>
          </div>

          <p className="text-sm opacity-80 leading-relaxed">
            Plataforma para gestão de restaurantes, focada em organização,
            agilidade e controle dos pedidos e operações.
          </p>

          <p className="text-xs opacity-60">
            © {new Date().getFullYear()} Serve. Todos os direitos reservados.
          </p>
        </section>

        {/* Navegação */}
        <section>
          <h4 className="text-sm font-semibold mb-4 uppercase tracking-wide opacity-90">
            Navegação
          </h4>

          <ul className="space-y-2 text-sm opacity-80">
            <li className="hover:opacity-100 cursor-pointer">Início</li>
            <li className="hover:opacity-100 cursor-pointer">Funcionalidades</li>
            <li className="hover:opacity-100 cursor-pointer">Sobre o projeto</li>
          </ul>
        </section>

        {/* Contato */}
        <section>
          <h4 className="text-sm font-semibold mb-4 uppercase tracking-wide opacity-90">
            Contato
          </h4>

          <ul className="space-y-3 text-sm opacity-80">
            <li className="flex items-center gap-2">
              <MapPin size={16} />
              <span>IFSUL – Campus Gravataí</span>
            </li>

            <li className="flex items-center gap-2">
              <Phone size={16} />
              <span>(51) 98517-5406</span>
            </li>

            <li className="flex items-center gap-2">
              <Mail size={16} />
              <span>calebeos07@gmail.com</span>
            </li>
          </ul>

          <div className="flex gap-4 mt-5">
            <a
              href="https://www.instagram.com/cal3be_os/"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-70 hover:opacity-100 transition"
            >
              <i className="bi bi-instagram text-xl"></i>
            </a>
          </div>
        </section>

      </div>
    </footer>
  );
}
