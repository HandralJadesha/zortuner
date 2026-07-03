"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Cpu,
  Layers,
  Sparkles,
  Scale,
  Info,
  MessageSquare,
  ShieldCheck,
  HelpCircle,
  Printer,
} from "lucide-react";
import ThreeDViewer from "../../components/ThreeDViewer.jsx";
import { api } from "../../lib/api.js";
import { useAuthStore } from "../../store/authStore.js";
export default function CustomPrintPage() {
  const router = useRouter();
  const { user } = useAuthStore(); /* File states */
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileBuffer, setFileBuffer] = useState(null);
  const [fileBase64, setFileBase64] = useState(""); /* Print parameters */
  const [selectedMaterial, setSelectedMaterial] = useState("PLA");
  const [selectedColor, setSelectedColor] = useState("White");
  const [selectedFinish, setSelectedFinish] = useState("Raw");
  const [infill, setInfill] = useState(20); /* Quote properties */
  const [estimating, setEstimating] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const simulateLocalQuote = () => {
    /* Simulated volume of 35cm3 */
    const vol = 35.0;
    const density =
      selectedMaterial === "PLA"
        ? 1.24
        : selectedMaterial === "ABS"
          ? 1.04
          : 1.15;
    const weight =
      Math.round(vol * (0.25 + 0.75 * (infill / 100)) * density * 10) / 10;
    const printDuration = Math.max(0.5, Math.round(vol * 0.15 * 10) / 10);
    const finishFee =
      selectedFinish === "Sanded"
        ? 150
        : selectedFinish === "Painted"
          ? 450
          : 0;
    const estimatedPrice = Math.max(
      150,
      Math.ceil(100 + weight * 2 + printDuration * 45 + finishFee),
    );
    setMetrics({
      volume: vol,
      dimensions: { length: 55, width: 45, height: 75 },
      weight,
      printDuration,
      estimatedPrice,
    });
  };
  const calculateInstantQuote = async () => {
    setEstimating(true);
    try {
      /* Call backend quote parser */
      const res = await api.post("/custom-orders/estimate", {
        fileName,
        fileBase64,
        selectedMaterial,
        selectedFinish,
        infill,
        volume: metrics?.volume /* send existing volume */,
        /* send existing volume if already parsed */
      });
      if (res.data.success) {
        setMetrics({
          volume: res.data.volume,
          dimensions: res.data.dimensions,
          weight: res.data.weight,
          printDuration: res.data.printDuration,
          estimatedPrice: res.data.estimatedPrice,
        });
      }
    } catch (err) {
      console.error(
        "Quote calculation error:",
        err,
      ); /* Fallback local calculations in case backend fails */
      simulateLocalQuote();
    } finally {
      setEstimating(false);
    }
  }; /* Trigger pricing estimation when parameters change */
  useEffect(() => {
    if (!file) return;
    const timer = setTimeout(() => calculateInstantQuote(), 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMaterial, selectedFinish, infill, file]);
  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer?.files[0] || e.target.files?.[0];
    const allowedExtensions = [".stl", ".obj", ".step", ".3mf", ".png", ".jpg", ".jpeg"];
    if (
      droppedFile &&
      allowedExtensions.some((ext) =>
        droppedFile.name.toLowerCase().endsWith(ext),
      )
    ) {
      processStlFile(droppedFile);
    } else {
      setError("Please upload a valid 3D model or image (.stl, .obj, .step, .3mf, .png, .jpg)");
    }
  };
  const processStlFile = (fileObj) => {
    setError(null);
    setFile(fileObj);
    setFileName(fileObj.name);
    setEstimating(true);
    const reader = new FileReader(); 
    reader.onload = (e) => {
      setFileBuffer(e.target.result); 
    };
    reader.readAsArrayBuffer(fileObj);

    const base64Reader = new FileReader();
    base64Reader.onload = (e) => {
      const dataUrl = e.target.result;
      const base64String = dataUrl.split(",")[1];
      setFileBase64(base64String);
    };
    base64Reader.readAsDataURL(fileObj);
  };
  const handleSubmitOrder = async () => {
    if (!user) {
      router.push("/login?redirect=custom-print");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      /* In production, upload raw STL to Cloudinary first. */
      /* Here we simulate and pass direct parameters. */
      const mimeType = fileName.match(/\.(jpeg|jpg)$/i) ? 'image/jpeg' : fileName.match(/\.png$/i) ? 'image/png' : 'application/octet-stream';
      const res = await api.post("/custom-orders", {
        fileUrl: `data:${mimeType};base64,${fileBase64}`,
        fileName,
        volume: metrics.volume,
        dimensions: metrics.dimensions,
        selectedMaterial,
        selectedColor,
        selectedFinish,
        infill,
      });
      if (res.data.success) {
        router.push("/dashboard?tab=custom");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit custom print order",
      );
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 relative min-h-[calc(100vh-80px)] flex flex-col justify-center">
      {" "}
      <div className="absolute top-[10%] left-10 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />{" "}
      <div className="text-center max-w-3xl mx-auto mb-4">
        {" "}
        <span className="text-[10px] font-bold text-accent uppercase tracking-wider bg-slate-100 border border-slate-200 rounded-full px-3 py-1">
          {" "}
          Precision Manufacturing{" "}
        </span>{" "}
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-2 sm:text-3xl">
          {" "}
          Custom 3D Printing Service{" "}
        </h1>{" "}
        <p className="mt-1 text-slate-500 font-light text-xs hidden sm:block">
          {" "}
          Upload your simple 3D models (`.stl`, `.obj`, `.step`, `.3mf`) or images (`.png`, `.jpg`), adjust
          settings, and get a live pricing quote instantly.{" "}
        </p>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
        {" "}
        {/* Left Column: Drop Area & 3D Viewer */}{" "}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {" "}
          {!file ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center bg-white hover:bg-slate-50/80 transition-all text-center gap-3 cursor-pointer relative h-full min-h-[250px]"
            >
              {" "}
              <input
                type="file"
                accept=".stl,.obj,.step,.3mf,.png,.jpg,.jpeg"
                onChange={handleFileDrop}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />{" "}
              <div className="rounded-lg bg-slate-100 p-3 text-primary">
                {" "}
                <Upload className="h-8 w-8" />{" "}
              </div>{" "}
              <div>
                {" "}
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Drag and drop your 3D model or image
                </h3>{" "}
                <p className="text-slate-500 text-xs font-light mt-1">
                  Supports 3D models or images up to 20MB
                </p>{" "}
              </div>{" "}
              <button className="rounded-full bg-primary text-white px-5 py-2 text-xs font-bold transition-all border border-primary hover:bg-transparent hover:text-primary transition-all duration-300">
                {" "}
                Browse Files{" "}
              </button>{" "}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {" "}
              <div className="flex justify-between items-center bg-white border border-slate-300 rounded-lg px-5 py-3">
                {" "}
                <div className="flex items-center gap-3">
                  {" "}
                  <div className="rounded bg-primary/10 p-2 text-primary">
                    {" "}
                    <Layers className="h-5 w-5" />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <h3 className="font-bold text-slate-900 text-sm max-w-xs truncate">
                      {fileName}
                    </h3>{" "}
                    <span className="text-[10px] text-slate-500">
                      Ready for 360° inspection
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
                <button
                  onClick={() => {
                    setFile(null);
                    setFileBuffer(null);
                    setMetrics(null);
                  }}
                  className="text-xs text-red-400 hover:underline cursor-pointer"
                >
                  {" "}
                  Remove File{" "}
                </button>{" "}
              </div>{" "}
              {/* Live 3D Mesh inspection or Image Preview */}{" "}
              <div className="relative h-[250px] xl:h-[280px] w-full rounded-lg overflow-hidden glass-panel border border-primary/10 flex items-center justify-center bg-slate-50/50">
                {" "}
                {fileName.match(/\.(jpeg|jpg|png)$/i) ? (
                  <img src={file ? URL.createObjectURL(file) : ""} alt="Preview" className="max-h-full max-w-full object-contain p-4" />
                ) : (
                  <ThreeDViewer
                    fileBuffer={fileBuffer}
                    className="w-full h-full border-none"
                    autoRotate={false}
                  />
                )}{" "}
              </div>{" "}
            </div>
          )}{" "}
          {/* Guide Details */}{" "}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white/80 rounded-lg border border-slate-200 p-3 text-[9px] xl:text-[10px] text-slate-500">
            {" "}
            <div className="flex flex-col gap-1">
              {" "}
              <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Printability Checks
              </h4>{" "}
              <p className="leading-tight">
                All models are structurally verified. If a mesh
                overhang fails, we coordinate supports.
              </p>{" "}
            </div>{" "}
            <div className="flex flex-col gap-1">
              {" "}
              <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-primary" />
                FDM vs SLA Resin
              </h4>{" "}
              <p className="leading-tight">
                We print PLA/PETG models, and SLA high-detail
                figurines with specialized UV resins.
              </p>{" "}
            </div>{" "}
            <div className="flex flex-col gap-1">
              {" "}
              <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-accent" />
                Admin Approvals
              </h4>{" "}
              <p className="leading-tight">
                Instant quotes are estimations. Final pricing is approved by
                admins, and payments are logged dynamically.
              </p>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* Right Column: Customizer & Checkout */}{" "}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {" "}
          <div className="glass-panel border border-primary/10 rounded-lg p-4 flex flex-col gap-3">
            {" "}
            <h2 className="text-base font-bold text-slate-900 tracking-tight border-b border-primary/10 pb-2">
              Configure Settings
            </h2>{" "}
            {/* Material */}{" "}
            <div className="flex flex-col gap-2">
              {" "}
              <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Material
              </span>{" "}
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-primary"
              >
                {" "}
                <option value="PLA">
                  PLA (Organic - Biodegradable, Great details)
                </option>{" "}
              </select>{" "}
            </div>{" "}
            {/* Infill */}{" "}
            <div className="flex flex-col gap-2">
              {" "}
              <div className="flex justify-between text-xs font-semibold tracking-wider text-slate-500 uppercase">
                {" "}
                <span>Infill Density</span>{" "}
                <span className="text-primary">{infill}%</span>{" "}
              </div>{" "}
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={infill}
                onChange={(e) => setInfill(Number(e.target.value))}
                className="w-full accent-primary bg-slate-200 h-1 rounded"
              />{" "}
              <span className="text-[10px] text-slate-500">
                20% infill is standard for figurines; 40%+ for mechanical parts.
              </span>{" "}
            </div>{" "}
            {/* Color */}{" "}
            <div className="flex flex-col gap-2">
              {" "}
              <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Filament Color
              </span>{" "}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {" "}
                {[
                  { name: "White", bg: "bg-white", text: "text-slate-800" },
                  { name: "Black", bg: "bg-slate-900", text: "text-white" },
                  { name: "Grey", bg: "bg-slate-500", text: "text-white" },
                  { name: "Red", bg: "bg-red-500", text: "text-white" },
                  { name: "Blue", bg: "bg-blue-500", text: "text-white" },
                  { name: "Gold", bg: "bg-yellow-500", text: "text-white" },
                  {
                    name: "Silver",
                    bg: "bg-slate-300",
                    text: "text-slate-800",
                  },
                ].map((col) => (
                  <button
                    key={col.name}
                    onClick={() => setSelectedColor(col.name)}
                    className={`rounded-lg py-1.5 text-[10px] font-bold border-2 transition-all cursor-pointer ${col.bg} ${col.text} ${selectedColor === col.name ? "border-primary ring-2 ring-primary/20 shadow-md scale-105" : "border-transparent opacity-90 hover:opacity-100 hover:scale-105"}`}
                  >
                    {" "}
                    {col.name}{" "}
                  </button>
                ))}{" "}
              </div>{" "}
            </div>{" "}
            {/* Post finish */}{" "}
            <div className="flex flex-col gap-2">
              {" "}
              <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Finish Post-Processing
              </span>{" "}
              <div className="grid grid-cols-3 gap-2">
                {" "}
                {[
                  { name: "Raw", desc: "No cleanup" },
                  { name: "Sanded", desc: "Smooth + ₹150" },
                  { name: "Painted", desc: "Primed + ₹450" },
                ].map((f) => (
                  <button
                    key={f.name}
                    onClick={() => setSelectedFinish(f.name)}
                    className={`rounded-lg p-1.5 border flex flex-col items-center gap-0.5 transition-all cursor-pointer ${selectedFinish === f.name ? "bg-primary border-primary text-white shadow" : "bg-white border-slate-300 text-slate-600 hover:text-slate-900"}`}
                  >
                    {" "}
                    <span className="text-xs font-bold">{f.name}</span>{" "}
                    <span className="text-[9px] font-light opacity-80">
                      {f.desc}
                    </span>{" "}
                  </button>
                ))}{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          {/* Pricing Quote & Submissions */}{" "}
          {file && (
            <div className="glass-panel border border-primary/10 rounded-lg p-4 flex flex-col gap-3 animate-in fade-in duration-300">
              {" "}
              <h2 className="text-sm font-bold text-slate-900 tracking-tight border-b border-primary/10 pb-2 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-accent" />
                Instant Estimate Quote
              </h2>{" "}
              {estimating ? (
                <div className="py-6 flex items-center justify-center">
                  {" "}
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>{" "}
                  <span className="ml-3 text-xs text-slate-400">
                    Recalculating quotes...
                  </span>{" "}
                </div>
              ) : (
                <div className="flex flex-col gap-2 text-xs text-slate-500">
                  {" "}
                  <div className="flex justify-between border-b border-primary/10 pb-2">
                    {" "}
                    <span className="flex items-center gap-1.5">
                      <Scale className="h-3.5 w-3.5" />
                      Weight
                    </span>{" "}
                    <span className="font-semibold text-slate-800">
                      {metrics?.weight} grams
                    </span>{" "}
                  </div>{" "}
                  <div className="flex justify-between border-b border-primary/10 pb-2">
                    {" "}
                    <span className="flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5" />
                      Dimensions (X x Y x Z)
                    </span>{" "}
                    <span className="font-semibold text-slate-800">
                      {metrics?.dimensions?.length} x{" "}
                      {metrics?.dimensions?.width} x{" "}
                      {metrics?.dimensions?.height} mm
                    </span>{" "}
                  </div>{" "}
                  <div className="flex justify-between border-b border-primary/10 pb-2">
                    {" "}
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5" />
                      Total Volume
                    </span>{" "}
                    <span className="font-semibold text-slate-800">
                      {metrics?.volume} cm³
                    </span>{" "}
                  </div>{" "}
                  <div className="flex justify-between border-b border-primary/10 pb-2">
                    {" "}
                    <span className="flex items-center gap-1.5">
                      <Printer className="h-3.5 w-3.5" />
                      Estimated Print Time
                    </span>{" "}
                    <span className="font-semibold text-slate-800">
                      ~ {metrics?.printDuration} hours
                    </span>{" "}
                  </div>{" "}
                  <div className="mt-1 bg-primary/10 border border-primary/20 rounded-xl p-3 flex justify-between items-center">
                    {" "}
                    <div className="flex flex-col gap-0.5">
                      {" "}
                      <span className="text-[10px] text-primary uppercase font-bold tracking-wider">
                        Estimated Price
                      </span>{" "}
                      <span className="text-lg lg:text-xl font-extrabold text-slate-900">
                        ₹{metrics?.estimatedPrice}
                      </span>{" "}
                    </div>{" "}
                    <span className="text-[9px] text-slate-500 max-w-[120px] text-right">
                      Includes GST. Excludes shipping fees.
                    </span>{" "}
                  </div>{" "}
                  {error && (
                    <p className="text-red-400 text-center mt-2">{error}</p>
                  )}{" "}
                  <button
                    onClick={handleSubmitOrder}
                    disabled={submitting}
                    className="w-full rounded-full bg-gradient-to-r from-primary to-secondary py-2 text-white font-bold text-xs tracking-wider shadow-lg hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 border border-primary hover:bg-none hover:bg-transparent hover:text-primary transition-all duration-300"
                  >
                    {" "}
                    {submitting ? "Submitting..." : "Submit"}{" "}
                  </button>{" "}
                </div>
              )}{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
