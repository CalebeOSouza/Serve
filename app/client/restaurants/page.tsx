import Link from "next/link";
import { Star } from "lucide-react";

export default function UserType() {
  const profiles = [
    {
      id: 1,
      title: "Restaurantes",
      image:
        "https://img.freepik.com/fotos-gratis/composicao-de-comida-brasileira-deliciosa-de-alto-angulo_23-2148739223.jpg?semt=ais_hybrid&w=740&q=80",
    },
    {
      id: 2,
      title: "Mercados",
      image:
        "https://img.freepik.com.br/fotos-gratis/prateleiras-de-supermercado-com-produtos_23-2148286213.jpg",
    },
    {
      id: 3,
      title: "Padarias",
      image:
        "https://img.freepik.com/fotos-premium/paes-frescos-na-cesta-na-padaria_1074121-34440.jpg",
    },
    {
      id: 4,
      title: "Farmácias",
      image:
        "https://img.freepik.com/fotos-gratis/farmacia-e-farmacia-com-medicamentos-nas-prateleiras_23-2149232231.jpg",
    },
    {
      id: 5,
      title: "Pet Shops",
      image:
        "https://img.freepik.com/fotos-gratis/acessorios-para-animais-de-estimacao-em-cima-da-mesa_23-2148869151.jpg",
    },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-10 bg-gray-50">
      <div className="flex flex-col text-center w-full ">
        <div className="flex flex-start">
          <h1 className="mb-3 text-2xl font-bold text-[#1F2933]">
            Restaurantes
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="group flex flex-col w-full transition-all duration-300 cursor-pointer"
            >
              <div className="relative w-full aspect-video overflow-hidden rounded-xl shadow-sm bg-gray-200">
                <img
                  src={profile.image}
                  alt={profile.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />
              </div>

              <div className="px-4 flex">
                <div className="flex flex-col items-start mt-3 flex-1">
                  <div className="w-12 h-12 rounded-full border-4 border-white shadow-md -mt-6 relative z-10 overflow-hidden bg-white">
                    <img
                      src="https://images.rappi.com.br/restaurants_logo/86b2cf61-b936-4f8c-bd80-d84e53bda210-1613578023539.jpeg?e=webp&d=10x10&q=10"
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="mt-2 font-bold text-[#1F2933] group-hover:text-(--color-primary) transition-colors">
                    {profile.title}
                  </h3>
                  <span className="text-xs text-gray-400">
                    Clique para selecionar
                  </span>
                </div>

                <div className="flex justify-center items-end">
                  <span className="bg-[#e5ebff] flex items-center text-center gap-1 px-2 py-0.5 rounded-full mt-2">
                    <i className="bi bi-star-fill text-xs text-(--color-primary)"></i>
                    {/* text-[#728fc9] bg-[#e5ebff] bg-[#FFF2E5] */}
                    <p className="text-[12px] font-bold">0.0</p>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
