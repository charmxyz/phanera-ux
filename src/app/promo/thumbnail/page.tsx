import { PixelAnt } from "@/components/ants/pixel-ant";
import { HeroFlower } from "@/components/landing/flower/hero-flower";

/** 1920×1080 thumbnail: logo + name + tagline on the left, the voxel flower on the right. */
export default function Thumbnail() {
  return (
    <div className="relative flex h-[1080px] w-[1920px] items-center overflow-hidden bg-white">
      <div className="relative z-10 grid gap-8 pl-[150px]">
        <h1 className="flex items-center gap-6 text-[132px] leading-none font-medium tracking-[-0.04em] text-[#111114]">
          <PixelAnt className="h-[120px] w-auto" />
          Phanera
        </h1>
        <h2 className="max-w-[760px] text-[56px] leading-[1.1] font-normal tracking-[-0.025em] text-[#5d5d66]">
          See your product through your users&apos; eyes.
        </h2>
      </div>
      <div className="absolute inset-y-0 right-0 w-[56%]">
        <HeroFlower />
      </div>
    </div>
  );
}
