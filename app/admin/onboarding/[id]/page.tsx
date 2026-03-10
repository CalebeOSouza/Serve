"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

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

  type: "matriz" | "filial" | null;
  parentId: number | null;
};

export default function AdminMenu() {
  const params = useParams();
  const id = params.id as string;

  const [step, setStep] = useState<Step | null>(null);

  const [profileData, setProfileData] = useState<ProfileForm>({
    name: "",
    description: "",
    zipcode: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",

    type: null,
    parentId: null,
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  //Redirecionar para o passo correto caso haja um onboarding em andamento
  useEffect(() => {
    async function loadRestaurant() {
      const res = await fetch("/api/restaurant/onboarding-status");
      const data = await res.json();

      if (!data.exists) {
        setStep("profile");
        return;
      }

      const r = data.restaurant;

      setRestaurantId(r.id);

      setProfileData(r.profile);

      setLogoPreview(r.media.logo);
      setBannerPreview(r.media.banner);

      if (r.onboarding_step === 1) {
        setStep("profile");
      } else if (r.onboarding_step === 2) {
        if (r.profile.type === "filial") {
          setStep("hours");
        } else {
          setStep("media");
        }
      } else if (r.onboarding_step === 3) {
        setStep("hours");
      }
    }

    loadRestaurant();
  }, []);
  // Atualizar o updated at do onboarding a cada 1 minuto para evitar que seja considerado abandonado
  useEffect(() => {
    if (!restaurantId) return;

    const sendHeartbeat = async () => {
      try {
        await fetch("/api/onboarding-heartbeat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ restaurantId }),
        });
      } catch (err) {
        console.error(err);
      }
    };

    sendHeartbeat();

    const interval = setInterval(sendHeartbeat, 60000);

    return () => clearInterval(interval);
  }, [restaurantId]);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const router = useRouter();

  // Canal de comunicação para evitar que o mesmo onboarding seja aberto em múltiplas abas
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

    setTimeout(() => {
      isOwner = true;
    }, 500);

    return () => {
      channel.close();
    };
  }, []);

  function goBack() {
    if (step === "media") {
      setStep("profile");
    } else if (step === "hours") {
      if (profileData.type === "filial") setStep("profile");
      else setStep("media");
    } else if (step === "success") setStep("hours");
  }

  if (!step) return null;

  return (
    <section className="min-h-screen bg-[#F6F8FB] p-8">
      {step === "profile" && (
        <RestaurantProfile
          mode="onboarding"
          form={profileData}
          setForm={setProfileData}
          restaurantId={restaurantId}
          setRestaurantId={setRestaurantId}
          onNext={() => {
            if (profileData.type === "filial") setStep("hours");
            else setStep("media");
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

      {step === "success" && <RestaurantSuccess />}
    </section>
  );
}
