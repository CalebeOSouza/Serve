"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import RestaurantProfile from "@/components/restaurant_settings/restaurant_profile";
import RestaurantMedia from "@/components/restaurant_settings/restaurant_media";
import RestaurantHours from "@/components/restaurant_settings/restaurant_hours";
import RestaurantSuccess from "@/components/restaurant_settings/restaurant_success";

type Step = "profile" | "media" | "hours" | "success";

type ProfileForm = {
  name: string;
  description: string;
  zipcode: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
};

export default function AdminMenu() {
  const params = useParams();
  const id = params.id as string;

  const [step, setStep] = useState<Step | null>(null);
const [loading, setLoading] = useState(true);

  const [profileData, setProfileData] = useState<ProfileForm>({
    name: "",
    description: "",
    zipcode: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);

  useEffect(() => {
  async function loadRestaurant() {
    try {
      const res = await fetch("/api/restaurant/onboarding-status", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!data.exists) {
        setStep("profile");
        return;
      }

      const r = data.restaurant;

      if (r.onboarding_step === 0) {
        setRestaurantId(r.id);
        setProfileData(r.profile);
        setLogoPreview(r.media.logo);
        setBannerPreview(r.media.banner);
        setStep("success");
        return;
      }

      setRestaurantId(r.id);
      setProfileData(r.profile);
      setLogoPreview(r.media.logo);
      setBannerPreview(r.media.banner);

      if (r.onboarding_step === 1) {
        setStep("profile");
      } else if (r.onboarding_step === 2) {
        setStep("media");
      } else if (r.onboarding_step === 3) {
        setStep("hours");
      }
    } catch (error) {
      console.error("Erro ao carregar restaurante:", error);
    } finally {
      setLoading(false);
    }
  }

  loadRestaurant();
}, []);

  useEffect(() => {
    if (!restaurantId || step === "success") return;

    const sendHeartbeat = async () => {
      try {
        await fetch("/api/onboarding-heartbeat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ restaurantId }),
          cache: "no-store",
        });
      } catch (error) {
        console.error("Erro ao enviar heartbeat:", error);
      }
    };

    sendHeartbeat();

    const interval = setInterval(sendHeartbeat, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [restaurantId, step]);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const router = useRouter();

  useEffect(() => {
    const channel = new BroadcastChannel("onboarding_channel");

    channelRef.current = channel;

    let isOwner = true;

    channel.onmessage = (event) => {
      if (event.data === "onboarding-active") {
        if (!isOwner) {
          router.push("/admin/my-restaurants");
        }
      }

      if (event.data === "who-is-onboarding") {
        if (isOwner) {
          channel.postMessage("onboarding-active");
        }
      }
    };

    channel.postMessage("who-is-onboarding");

    const timeout = setTimeout(() => {
      isOwner = true;
    }, 500);

    return () => {
      clearTimeout(timeout);
      channel.close();
    };
  }, [router]);

  function goBack() {
    if (step === "media") {
      setStep("profile");
    } else if (step === "hours") {
      setStep("media");
    } else if (step === "success") {
      setStep("hours");
    }
  }

if (loading) {
  return (
    <section className="min-h-screen bg-(--color-background) flex items-center justify-center p-8">
      <div className="w-full max-w-[576px] min-h-[671px] flex flex-col bg-white border border-[#DCE7F4] rounded-lg shadow-sm overflow-hidden animate-pulse mt-30">

        {/* Barra superior */}
        <div className="w-full h-[6px] bg-[#1B325F]" />

        {/* Conteúdo */}
        <div className="flex-1 px-8 pt-8 pb-12">

          {/* Título e descrição */}
          <div className="flex flex-col items-center gap-4 mb-12">
            <div className="h-8 w-3/4 rounded-md bg-[#DCE7F4]" />
            <div className="h-4 w-4/5 rounded-md bg-[#EDF3FA]" />
          </div>

          {/* Campos */}
          <div className="grid grid-cols-2 gap-10">

            {/* Coluna esquerda */}
            <div className="flex flex-col gap-6">
              <div className="h-5 w-4/5 rounded bg-[#DCE7F4]" />

              <div className="flex flex-col gap-2">
                <div className="h-4 w-4/5 rounded bg-[#E5EDF7]" />
                <div className="h-[50px] w-full rounded-md bg-[#DCE7F4]" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="h-4 w-3/4 rounded bg-[#E5EDF7]" />
                <div className="h-[50px] w-full rounded-md bg-[#EDF3FA]" />
              </div>
            </div>

            {/* Coluna direita */}
            <div className="flex flex-col gap-6">
              <div className="h-5 w-2/3 rounded bg-[#DCE7F4]" />

              <div className="flex flex-col gap-2">
                <div className="h-4 w-1/3 rounded bg-[#E5EDF7]" />
                <div className="h-[50px] w-full rounded-md bg-[#DCE7F4]" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="h-4 w-1/3 rounded bg-[#E5EDF7]" />
                <div className="h-[50px] w-full rounded-md bg-[#EDF3FA]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-2/3 rounded bg-[#E5EDF7]" />
                  <div className="h-[50px] w-full rounded-md bg-[#DCE7F4]" />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="h-4 w-2/3 rounded bg-[#E5EDF7]" />
                  <div className="h-[50px] w-full rounded-md bg-[#EDF3FA]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <div className="h-4 w-2/3 rounded bg-[#E5EDF7]" />
                  <div className="h-[50px] w-full rounded-md bg-[#DCE7F4]" />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="h-4 w-2/3 rounded bg-[#E5EDF7]" />
                  <div className="h-[50px] w-full rounded-md bg-[#EDF3FA]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botão */}
        <div className="w-full h-14 bg-[#1B325F]" />

      </div>
    </section>
  );
}

if (!step) return null;

  return (
    <section className="min-h-screen bg-(--color-background) p-8">
      {step === "profile" && (
        <RestaurantProfile
          mode="onboarding"
          form={profileData}
          setForm={setProfileData}
          restaurantId={restaurantId}
          setRestaurantId={setRestaurantId}
          onNext={() => {
            setStep("media");
          }}
        />
      )}

      {step === "media" && (
        <RestaurantMedia
          mode="onboarding"
          restaurantId={restaurantId}
          setRestaurantId={setRestaurantId}
          logoPreview={logoPreview}
          setLogoPreview={setLogoPreview}
          bannerPreview={bannerPreview}
          setBannerPreview={setBannerPreview}
          logoFile={logoFile}
          setLogoFile={setLogoFile}
          bannerFile={bannerFile}
          setBannerFile={setBannerFile}
          onNext={() => setStep("hours")}
          onBack={goBack}
        />
      )}

      {step === "hours" && (
        <RestaurantHours
          restaurantId={restaurantId}
          mode="onboarding"
          logoPreview={logoPreview}
          bannerPreview={bannerPreview}
          onNext={() => setStep("success")}
          onBack={goBack}
        />
      )}

      {step === "success" && (
        <RestaurantSuccess logoPreview={logoPreview} />
      )}
    </section>
  );
}