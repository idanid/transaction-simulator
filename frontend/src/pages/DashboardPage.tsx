import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTransactionStore } from "@/store/transactionStore";
import { transactionService } from "@/services/transaction.service";
import { RegionSelector } from "@/components/RegionSelector";
import { TimePicker } from "@/components/TimePicker";
import { TransactionCard } from "@/components/TransactionCard";
import desktopMockup from "@/assets/desktop-mockup.png";
import mobileMockup from "@/assets/mobile-mockup.png";

const CARD_UNIT = 304; // 280px card + 24px gap-6

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";

  const {
    selectedRegion,
    selectedTime,
    approvedTransactions,
    isSubmitting,
    setRegion,
    setTime,
    submitTransaction,
    fetchApproved,
  } = useTransactionStore();

  // ── Carousel ──────────────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);

  // Measure how many cards fit; runs synchronously after paint to avoid flicker
  useLayoutEffect(() => {
    const measure = () => {
      const w = containerRef.current?.offsetWidth ?? 0;
      const visible = Math.floor((w + 24) / CARD_UNIT);
      setMaxIndex(Math.max(0, approvedTransactions.length - visible));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [approvedTransactions.length]);

  // Reset to first card whenever the list changes or language switches
  useEffect(() => {
    setCarouselIndex(0);
  }, [approvedTransactions.length, isRTL]);

  // Clamp index when maxIndex shrinks (e.g. window resize)
  useEffect(() => {
    setCarouselIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const scrollCarousel = (dir: "left" | "right") => {
    setCarouselIndex((prev) =>
      Math.min(Math.max(0, prev + (dir === "right" ? 1 : -1)), maxIndex),
    );
  };

  /*
   * Layout strategy for RTL:
   *   - Reverse the card array so Card 1 sits at the physical RIGHT end
   *     in a dir="ltr" flex row.
   *   - Translate so the rightmost group (containing Card 1) is visible first.
   *
   * LTR: translateX(-index * CARD_UNIT)          → index 0 shows Card 1 on LEFT
   * RTL: translateX(-(maxIndex-index)*CARD_UNIT)  → index 0 shows Card 1 on RIGHT
   *
   * Both arrows use the same onClick ('left'=decrement, 'right'=increment).
   * Only the icons flip: in RTL the physically-right button shows → (ChevronRight)
   * and the physically-left button shows ← (ChevronLeft).
   */
  const displayedCards = isRTL
    ? [...approvedTransactions].reverse()
    : approvedTransactions;

  /*
   * In RTL the overflow container is right-justified (flex justify-end), so the
   * inner div's right edge always sits flush against the container's right edge.
   * Navigation shifts the inner div RIGHTWARD (positive translateX) to reveal
   * cards on the left — no gap between Card 1 and the → button.
   */
  const translateX = isRTL
    ? carouselIndex * CARD_UNIT // positive: moves inner div right
    : -(carouselIndex * CARD_UNIT); // negative: moves inner div left

  // ── Time / Submit ─────────────────────────────────────────────────────────
  const [timeConfirmed, setTimeConfirmed] = useState(false);

  useEffect(() => {
    fetchApproved();
  }, [fetchApproved]);

  useEffect(() => {
    setTimeConfirmed(false);
    if (!selectedRegion) return;
    transactionService
      .getCurrentTime(selectedRegion)
      .then(setTime)
      .catch(() => {});
  }, [selectedRegion, setTime]);

  const handleSubmit = async () => {
    if (!selectedRegion || !selectedTime) {
      toast.error(t("toast.error"));
      return;
    }
    try {
      const result = await submitTransaction();
      result.status === "Approved"
        ? toast.success(t("toast.approved"))
        : toast.error(t("toast.rejected"));
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setTimeConfirmed(false);
      if (selectedRegion) {
        transactionService.getCurrentTime(selectedRegion).then(setTime).catch(() => {});
      }
    }
  };

  const canSubmit = !isSubmitting && !!selectedRegion && timeConfirmed;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col">
      {/* Main content */}
      <section className="flex flex-row items-start px-16 py-16 gap-16 bg-white flex-wrap">
        {/* Controls */}
        <div className="flex flex-col gap-6 min-w-[328px]">
          <RegionSelector value={selectedRegion} onChange={setRegion} />
          <TimePicker
            value={selectedTime}
            onChange={setTime}
            onConfirm={() => setTimeConfirmed(true)}
            onCancel={() => setTimeConfirmed(false)}
            locked={timeConfirmed}
          />
          {canSubmit && (
            <button
              onClick={handleSubmit}
              className="mt-2 px-6 py-3 bg-[#65558F] text-white rounded-lg font-inter font-medium text-sm
                         hover:bg-[#4f4070] transition-colors"
            >
              {isSubmitting ? "..." : t("dashboard.submit")}
            </button>
          )}
        </div>

        {/* Hero */}
        <div className="flex flex-col items-center justify-center gap-8 flex-1 min-w-[300px]">
          <div
            className="px-4 py-1 rounded-[10px] text-[#363636] font-rubik font-bold text-lg"
            style={{
              background: "rgba(240,240,240,0.4)",
              border: "1px solid rgba(0,0,0,0.2)",
              backdropFilter: "blur(15px)",
            }}
          >
            {t("dashboard.badge")}
          </div>
          <p className="font-rubik font-normal text-2xl text-[#363636] text-center">
            {t("dashboard.headline")}
          </p>
          <div className="relative flex justify-center items-center w-full max-w-[550px]">
            <img
              src={desktopMockup}
              alt=""
              className="rounded-md w-full max-w-[530px]"
              style={{ marginInlineEnd: "-46px" }}
            />
            <img
              src={mobileMockup}
              alt=""
              className="absolute"
              style={{
                width: "128px",
                insetInlineEnd: "0",
                transform: "rotate(10deg)",
              }}
            />
          </div>
        </div>
      </section>

      {/* Approved transactions carousel */}
      <section className="px-16 py-16 bg-white">
        <h2
          className="font-inter font-semibold text-2xl text-[#1E1E1E] mb-12"
          style={{ letterSpacing: "-0.02em" }}
        >
          {t("dashboard.approved_title")}
        </h2>

        {approvedTransactions.length === 0 ? (
          <p className="text-[#49454F] text-sm">
            {t("dashboard.no_transactions")}
          </p>
        ) : (
          <div className="relative flex items-center gap-4">
            {/* First button — LEFT in LTR (physically), RIGHT in RTL (physically) */}
            <button
              onClick={() => scrollCarousel("left")}
              disabled={carouselIndex === 0}
              className="flex-none w-8 h-8 flex items-center justify-center bg-white rounded-full
                         disabled:opacity-30 transition-opacity hover:shadow-md"
              style={{ boxShadow: "0px 6.7px 14.9px rgba(0,0,0,0.08)" }}
            >
              {isRTL ? (
                <ChevronRight size={14} className="text-[#363636]" />
              ) : (
                <ChevronLeft size={14} className="text-[#363636]" />
              )}
            </button>

            {/* Overflow window — RTL: right-justify so Card 1 is always flush right */}
            <div
              ref={containerRef}
              className={`overflow-hidden flex-1${isRTL ? " flex justify-start" : ""}`}
            >
              {/*
                Always dir="ltr" so card physics are predictable.
                In RTL the cards are rendered in reverse order so Card 1 ends up
                at the physical RIGHT end of the LTR row.
              */}
              <div
                dir="ltr"
                className="flex gap-6"
                style={{
                  transform: `translateX(${translateX}px)`,
                  transition: "transform 320ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {displayedCards.map((tx) => (
                  <TransactionCard key={tx.id} transaction={tx} />
                ))}
              </div>
            </div>

            {/* Last button — RIGHT in LTR (physically), LEFT in RTL (physically) */}
            <button
              onClick={() => scrollCarousel("right")}
              disabled={carouselIndex >= maxIndex}
              className="flex-none w-8 h-8 flex items-center justify-center bg-white rounded-full
                         disabled:opacity-30 transition-opacity hover:shadow-md"
              style={{ boxShadow: "0px 6.7px 14.9px rgba(0,0,0,0.08)" }}
            >
              {isRTL ? (
                <ChevronLeft size={14} className="text-[#363636]" />
              ) : (
                <ChevronRight size={14} className="text-[#363636]" />
              )}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
