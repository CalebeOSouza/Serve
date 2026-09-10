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
        setStep("media");
      } else if (r.onboarding_step === 3) {
        setStep("hours");
      }
    }

    loadRestaurant();
  }, []);

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
        <RestaurantSuccess
          logoPreview={logoPreview}
        />
      )}
    </section>
  );
}
