"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import QRCode from "qrcode";
import { FaWhatsapp } from "react-icons/fa6";
import { ArrowLeft, Check, Clipboard, Download, MapPin, QrCode } from "lucide-react";

type GeneratedQr = {
  hrName: string;
  location: string;
  message: string;
  whatsappNumber: string;
  whatsappUrl: string;
};

export default function GeneratedQrPage() {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [hrName, setHrName] = useState("");
  const [positionName, setPositionName] = useState("");
  const [location, setLocation] = useState("");
  const [generatedQr, setGeneratedQr] = useState<GeneratedQr | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setCopied(false);

    const normalizedNumber = whatsappNumber.replace(/\D/g, "");
    const cleanHrName = hrName.trim();
    const cleanPositionName = positionName.trim();
    const cleanLocation = location.trim();

    if (!/^\d{8,15}$/.test(normalizedNumber)) {
      setError("Ingresa el número de WhatsApp con código de país, usando entre 8 y 15 dígitos.");
      return;
    }

    if (!cleanHrName || !cleanPositionName || !cleanLocation) {
      setError("Completa el nombre de Recursos Humanos, la plaza y su ubicación.");
      return;
    }

    const message = `Buenos días, estimada ${cleanHrName}, estoy interesad@ en la plaza ${cleanPositionName}, un gusto poder comunicarme con usted.`;
    const whatsappUrl = new URL(`https://wa.me/${normalizedNumber}`);
    whatsappUrl.searchParams.set("text", message);

    try {
      setIsGenerating(true);
      const dataUrl = await QRCode.toDataURL(whatsappUrl.toString(), {
        errorCorrectionLevel: "M",
        margin: 2,
        width: 1024,
        color: {
          dark: "#111827",
          light: "#ffffff",
        },
      });

      setGeneratedQr({
        hrName: cleanHrName,
        location: cleanLocation,
        message,
        whatsappNumber: normalizedNumber,
        whatsappUrl: whatsappUrl.toString(),
      });
      setQrDataUrl(dataUrl);
    } catch {
      setError("No se pudo generar el código QR. Inténtalo nuevamente.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopy() {
    if (!generatedQr) return;

    try {
      await navigator.clipboard.writeText(generatedQr.whatsappUrl);
      setCopied(true);
    } catch {
      setError("No se pudo copiar el enlace. Puedes copiarlo manualmente desde el navegador.");
    }
  }

  function handleDownload() {
    if (!qrDataUrl) return;

    const anchor = document.createElement("a");
    anchor.href = qrDataUrl;
    anchor.download = "qr-whatsapp-plaza.png";
    anchor.click();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_50%_-20%,_#193775_0,_#0a1530_36%,_#070b18_72%)] px-4 py-5 text-slate-100 sm:px-6 sm:py-8 lg:px-8">
      <section className="mx-auto w-full max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a Nicaragua Geo Recruit
        </Link>

        <div className="mt-4 grid items-start gap-5 rounded-[1.75rem] border border-white/10 bg-slate-950/45 p-4 shadow-2xl shadow-slate-950/25 backdrop-blur-sm sm:mt-6 sm:gap-6 sm:p-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)] xl:p-8">
          <section className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-emerald-200">
              <FaWhatsapp aria-hidden="true" className="h-4 w-4" />
              Herramienta para Recursos Humanos
            </div>
            <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-[1.08] tracking-tight text-white sm:text-4xl xl:text-[3.15rem]">
              Crea un QR de WhatsApp para recibir postulaciones directas.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Completa los datos de la plaza. Al escanear el código, el candidato abrirá un chat
              de WhatsApp con el mensaje de postulación listo para enviar.
            </p>

            <form onSubmit={handleGenerate} className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:mt-7 sm:p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="WhatsApp de Recursos Humanos" htmlFor="whatsapp-number" hint="Con código de país, sin + ni espacios.">
                  <input
                    id="whatsapp-number"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={whatsappNumber}
                    onChange={(event) => setWhatsappNumber(event.target.value)}
                    placeholder="50588888888"
                    className={inputClassName}
                    required
                  />
                </Field>

                <Field label="Nombre de la persona de RH" htmlFor="hr-name">
                  <input
                    id="hr-name"
                    type="text"
                    value={hrName}
                    onChange={(event) => setHrName(event.target.value)}
                    placeholder="Ana López"
                    className={inputClassName}
                    required
                  />
                </Field>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Nombre de la plaza" htmlFor="position-name">
                  <input
                    id="position-name"
                    type="text"
                    value={positionName}
                    onChange={(event) => setPositionName(event.target.value)}
                    placeholder="Asesora de ventas"
                    className={inputClassName}
                    required
                  />
                </Field>

                <Field label="Ubicación de la plaza" htmlFor="location">
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Managua, Carretera a Masaya"
                    className={inputClassName}
                    required
                  />
                </Field>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-950/25 transition hover:bg-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 disabled:cursor-wait disabled:opacity-60"
              >
                <QrCode className="h-4 w-4" />
                {isGenerating ? "Generando QR..." : "Generar QR de WhatsApp"}
              </button>

              {error ? (
                <p role="alert" className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-3.5 py-3 text-sm leading-5 text-rose-100">
                  {error}
                </p>
              ) : null}
            </form>
          </section>

          <aside className="xl:sticky xl:top-6">
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/65 p-4 shadow-xl shadow-slate-950/20 sm:p-5">
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-left">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-2xl text-white shadow-lg shadow-emerald-950/30">
                  <FaWhatsapp aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">QR-WHATSAPP</p>
                  <p className="mt-0.5 text-sm text-slate-200">Canal directo de postulación</p>
                </div>
              </div>

              {qrDataUrl && generatedQr ? (
                <div className="pt-5 text-center">
                  <div className="mx-auto inline-flex rounded-[1.4rem] bg-white p-3 shadow-xl shadow-slate-950/35 sm:p-4">
                    <Image
                      src={qrDataUrl}
                      alt={`Código QR de WhatsApp para contactar a ${generatedQr.hrName} de Recursos Humanos`}
                      className="h-52 w-52 sm:h-60 sm:w-60"
                      width={240}
                      height={240}
                      unoptimized
                    />
                  </div>

                  <dl className="mt-5 grid gap-3 text-left sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/8 bg-white/[0.035] px-3.5 py-3">
                      <dt className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-slate-500">Destino</dt>
                      <dd className="mt-1 truncate text-sm font-semibold text-slate-100">{generatedQr.hrName}</dd>
                      <dd className="mt-0.5 text-xs tabular-nums text-slate-400">+{generatedQr.whatsappNumber}</dd>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/[0.035] px-3.5 py-3">
                      <dt className="flex items-center gap-1 text-[0.68rem] font-bold uppercase tracking-[0.15em] text-slate-500">
                        <MapPin className="h-3 w-3" />
                        Ubicación
                      </dt>
                      <dd className="mt-1 line-clamp-2 text-sm font-medium leading-5 text-slate-200">{generatedQr.location}</dd>
                    </div>
                  </dl>

                  <blockquote className="mt-3 rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3.5 text-left text-sm leading-6 text-slate-300">
                    “{generatedQr.message}”
                  </blockquote>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => void handleCopy()}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Clipboard className="h-4 w-4" />}
                      {copied ? "Enlace copiado" : "Copiar enlace"}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
                    >
                      <Download className="h-4 w-4" />
                      Descargar PNG
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-80 flex-col items-center justify-center px-4 py-8 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-dashed border-emerald-300/30 bg-emerald-400/10 text-emerald-200">
                    <QrCode className="h-10 w-10" />
                  </div>
                  <h2 className="mt-5 text-lg font-semibold text-white">Tu QR aparecerá aquí</h2>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
                    Completa el formulario para crear un enlace de WhatsApp listo para compartir.
                  </p>
                </div>
              )}
            </section>
            <p className="mt-3 px-1 text-center text-xs leading-5 text-slate-400">
              El QR abre WhatsApp con el texto preparado; el candidato confirma el envío.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}

const inputClassName =
  "mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/15 focus:border-emerald-400/70 focus:bg-slate-950/70 focus:ring-2 focus:ring-emerald-400/20";

function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0 text-sm font-medium text-slate-200" htmlFor={htmlFor}>
      {label}
      {children}
      {hint ? <span className="mt-1.5 block text-xs font-normal text-slate-500">{hint}</span> : null}
    </label>
  );
}
