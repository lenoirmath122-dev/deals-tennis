import Image from "next/image";

export function Hero() {
  return (
    <section className="relative isolate mb-8 flex min-h-[280px] items-end overflow-hidden rounded-md sm:min-h-[360px]">
      <Image
        src="/hero/simone-viani-2XPHSXVT_Ls-unsplash.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f2419]/90 via-[#0f2419]/45 to-[#0f2419]/10" />
      <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10">
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Bons plans tennis</h1>
        <p className="mt-2 max-w-xl text-sm text-white/85 sm:text-base">
          Raquettes, cordages, chaussures, textile et accessoires : les meilleures promotions
          sélectionnées et mises à jour en continu.
        </p>
      </div>
    </section>
  );
}
