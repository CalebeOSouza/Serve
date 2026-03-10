import Link from "next/link";
import LogoutButton from "../logout_btn";
export default function ClienteMenu() {
  return (
    <>
      <div className="w-full mb-8 font-semibold text-[#1d3058]">
        <p className="text-(--color-primary) text-sm font-bold border-b border-b-gray-300 w-full py-3">
          Funções
        </p>
        <Link
          href="/"
          className="flex items-center py-5 gap-2 w-full relative transition-all hover:text-(--color-secondary)"
        >
          <li className={`flex items-center`}>
            Início
            <i className="absolute bi bi-chevron-right right-0 text-sm"></i>
          </li>
        </Link>

        <Link
          href="client/restaurants"
          className="border-y border-y-gray-300 flex items-center py-5 gap-2 w-full relative transition-all hover:text-(--color-secondary)"
        >
          <li className={`flex items-center`}>
            Restaurantes
            <i className="absolute bi bi-chevron-right right-0 text-sm"></i>
          </li>
        </Link>

        <Link
          href="#"
          className="border-b border-b-gray-300 flex items-center py-5 gap-2 w-full relative transition-all hover:text-(--color-secondary)"
        >
          <li className={`flex items-center`}>
            ...
            <i className="absolute bi bi-chevron-right right-0 text-sm"></i>
          </li>
        </Link>
      </div>
      <div className="flex flex-col items-start w-full text-start text-(--color-secondary) font-semibold">
        <p className="text-(--color-primary) text-sm font-bold border-b border-b-gray-300 w-full py-3">
          Conta
        </p>
        <div className="flex items-center gap-8">
          <li className="flex gap-5 items-center justify-start py-5 relative w-full">
            <Link href="#">...</Link>
          </li>
          <li className="hover:text-(--color-secondary)">
            <LogoutButton />
          </li>
        </div>
      </div>
    </>
  );
}
