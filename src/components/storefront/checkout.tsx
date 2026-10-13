"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { siteConfig } from "@/config/site";
import { useCartStore } from "@/lib/store/cart";
import { lastOrderPhoneStorageKey } from "@/lib/storefront/order-lookup";
import {
  checkoutFormSchema,
  savedCustomerInfoSchema,
  type CheckoutInput,
  type CheckoutValues,
  type SavedCustomerInfo,
} from "@/lib/validation/order";

const savedInfoStorageKey = "banh-tai-customer-info";
const formatPrice = (price: number) => new Intl.NumberFormat("vi-VN").format(price);
const savedInfoChangedEvent = "banh-tai-customer-info-changed";

function subscribeToSavedInfo(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(savedInfoChangedEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(savedInfoChangedEvent, onChange);
  };
}

function getSavedInfoSnapshot() {
  try {
    return window.localStorage.getItem(savedInfoStorageKey);
  } catch (error) {
    console.warn("Trình duyệt không cho phép đọc thông tin khách đã lưu:", error);
    return null;
  }
}

function notifySavedInfoChanged() {
  window.dispatchEvent(new Event(savedInfoChangedEvent));
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <span className="mt-1 block text-xs font-medium text-red-700">{message}</span>
  ) : null;
}

type OrderSuccess = {
  orderCode: string;
  total: number;
};

export function Checkout() {
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const [submitting, setSubmitting] = useState(false);
  const [cartExpanded, setCartExpanded] = useState(false);
  const savedInfoValue = useSyncExternalStore(
    subscribeToSavedInfo,
    getSavedInfoSnapshot,
    () => null,
  );
  const savedInfo = useMemo<SavedCustomerInfo | null>(() => {
    if (!savedInfoValue) return null;
    try {
      const parsed = savedCustomerInfoSchema.safeParse(JSON.parse(savedInfoValue) as unknown);
      if (!parsed.success) {
        console.warn("Bỏ qua thông tin khách hàng đã lưu không hợp lệ.");
        return null;
      }
      return parsed.data;
    } catch (error) {
      console.warn("Bỏ qua thông tin khách hàng đã lưu không đúng định dạng:", error);
      return null;
    }
  }, [savedInfoValue]);
  const [saveForLater, setSaveForLater] = useState(true);
  const [success, setSuccess] = useState<OrderSuccess | null>(null);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = items.length > 0 ? siteConfig.shippingFee : 0;
  const total = subtotal + shippingFee;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    setValue,
    formState: { errors },
  } = useForm<CheckoutInput, unknown, CheckoutValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customer_name: "",
      phone: "",
      house_number: "",
      ward: "",
      province: "",
      note: "",
      payment_method: "cod",
      website: "",
    },
  });

  useEffect(() => {
    if (!savedInfo) return;
    reset((currentValues) => ({
      ...currentValues,
      ...savedInfo,
    }));
  }, [reset, savedInfo]);

  async function onSubmit(values: CheckoutValues) {
    if (items.length === 0) {
      toast.error("Giỏ hàng đang trống. Vui lòng chọn sản phẩm trước.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          items: items.map(({ slug, quantity }) => ({ slug, quantity })),
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        orderCode?: string;
        total?: number;
      };

      if (!response.ok) {
        toast.error(result.error ?? "Chưa thể gửi đơn hàng. Vui lòng thử lại.");
        return;
      }
      if (
        !result.orderCode ||
        result.total === undefined ||
        !Number.isSafeInteger(result.total)
      ) {
        toast.error("Shop chưa xác nhận đầy đủ đơn hàng. Vui lòng liên hệ để kiểm tra.");
        return;
      }

      try {
        window.localStorage.setItem(lastOrderPhoneStorageKey, values.phone);
      } catch (error) {
        console.error("Không thể lưu số điện thoại để tra cứu đơn hàng:", error);
        toast.warning("Đơn hàng đã gửi nhưng không thể lưu số điện thoại tra cứu trên thiết bị.");
      }

      const nextSavedInfo = {
        phone: values.phone,
        customer_name: values.customer_name,
        house_number: values.house_number,
        ward: values.ward,
        province: values.province,
      };
      if (saveForLater) {
        try {
          window.localStorage.setItem(savedInfoStorageKey, JSON.stringify(nextSavedInfo));
          notifySavedInfoChanged();
        } catch (error) {
          console.error("Không thể lưu thông tin giao hàng trên thiết bị:", error);
          toast.warning("Đơn hàng đã gửi nhưng trình duyệt không thể lưu thông tin cho lần sau.");
        }
      } else {
        try {
          window.localStorage.removeItem(savedInfoStorageKey);
          notifySavedInfoChanged();
        } catch (error) {
          console.error("Không thể xóa thông tin giao hàng đã lưu:", error);
          toast.warning("Đơn hàng đã gửi nhưng chưa xóa được thông tin đã lưu trên thiết bị.");
        }
      }

      clearCart();
      reset({
        customer_name: "",
        phone: "",
        house_number: "",
        ward: "",
        province: "",
        note: "",
        payment_method: "cod",
        website: "",
      });
      setSuccess({
        orderCode: result.orderCode,
        total: result.total,
      });
    } catch (error) {
      console.error("Không thể gửi đơn hàng:", error);
      toast.error("Kết nối chưa ổn định. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  }

  function clearSavedInfo() {
    try {
      window.localStorage.removeItem(savedInfoStorageKey);
      notifySavedInfoChanged();
      setValue("phone", "");
      setValue("customer_name", "");
      setValue("house_number", "");
      setValue("ward", "");
      setValue("province", "");
      setSaveForLater(true);
      toast.success("Đã xóa thông tin đã lưu trên thiết bị này.");
    } catch (error) {
      console.error("Không thể xóa thông tin giao hàng đã lưu:", error);
      toast.error("Trình duyệt không cho phép xóa thông tin đã lưu.");
    }
  }

  function resetCheckoutAfterSuccess() {
    clearCart();
    reset({
      customer_name: savedInfo?.customer_name ?? "",
      phone: savedInfo?.phone ?? "",
      house_number: savedInfo?.house_number ?? "",
      ward: savedInfo?.ward ?? "",
      province: savedInfo?.province ?? "",
      note: "",
      payment_method: "cod",
      website: "",
    });
    setSuccess(null);
  }

  if (success) {
    return (
      <div className="mx-auto w-full max-w-lg space-y-5">
        <section
          role="status"
          className="rounded-3xl border border-green-900/10 bg-white p-6 text-center shadow-sm sm:p-8"
        >
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-100 text-green-800">
            <Check className="size-7" />
          </span>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
            Shop đã nhận đơn
          </p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-brown">
            Cảm ơn bạn đã đặt bánh!
          </h2>
          <p className="mt-2 text-sm leading-6 text-brown/60">
            Bạn sẽ nhận được hàng từ 3 - 5 ngày tới!
          </p>
          <div className="mt-5 rounded-2xl bg-cream p-4">
            <p className="text-xs text-brown/55">Mã đơn hàng</p>
            <p className="mt-1 text-xl font-extrabold tracking-wider text-terracotta">
              {success.orderCode}
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-brown/10 pt-3 text-sm">
              <span className="text-brown/60">Tổng tiền</span>
              <strong className="text-brown">{formatPrice(success.total)}đ</strong>
            </div>
          </div>
          <p className="mt-4 text-sm text-brown/60">
            Dùng số điện thoại đặt hàng để xem tất cả đơn hàng của bạn.
          </p>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Link
              href="/tra-cuu-don"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brown px-4 text-sm font-bold text-white transition hover:bg-terracotta"
            >
              Lịch sử đơn hàng
            </Link>
            <Link
              href="/san-pham"
              onClick={resetCheckoutAfterSuccess}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-brown/15 px-4 text-sm font-bold text-brown transition hover:border-terracotta hover:text-terracotta"
            >
              Xem thêm bánh <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    );
  }
  console.log(items, "item")
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="overflow-hidden rounded-3xl border border-brown/10 bg-white p-0 shadow-sm lg:p-5">
          <div className="lg:hidden">
            <button
              type="button"
              aria-expanded={cartExpanded}
              aria-controls="checkout-cart-items"
              onClick={() => setCartExpanded((expanded) => !expanded)}
              className="flex w-full items-center justify-between gap-3 border-b border-brown/10 px-4 py-4 text-left"
            >
              <span className="min-w-0 text-sm font-bold text-brown">
                Đơn hàng ({itemCount} sản phẩm)
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <strong className="text-sm text-sky-600">{formatPrice(total)}đ</strong>
                <ChevronDown
                  aria-hidden="true"
                  className={`size-4 text-brown transition-transform ${cartExpanded ? "rotate-180" : ""}`}
                />
              </span>
            </button>
          </div>
          <div className="mb-3 hidden items-center justify-between border-b border-brown/10 pb-3 lg:flex">
            <div>
              <h2 className="font-serif text-lg font-bold">Đơn hàng</h2>
              <p className="mt-0.5 text-xs text-brown/55">
                {itemCount} sản phẩm
              </p>
            </div>
            <ShoppingBag className="size-5 text-terracotta" />
          </div>
          <div
            id="checkout-cart-items"
            className={`${cartExpanded ? "block" : "hidden"} px-4 pb-4 mt-4 lg:block lg:px-0 lg:pb-0`}
          >
            {items.length === 0 ? (
              <div className="rounded-2xl bg-cream/70 px-4 py-6 text-center">
                <p className="font-bold text-brown">Giỏ hàng đang trống</p>
                <p className="mt-1 text-xs text-brown/55">Chọn bánh trước, shop chờ bạn nhé.</p>
                <Link
                  href="/san-pham"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-terracotta"
                >
                  Xem sản phẩm <ArrowRight className="size-4" />
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-brown/10">
                {items.map((item) => (
                  <li key={item.slug} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-brown">
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-xs text-brown/55">
                        {
                          item.price
                        } / {
                          item.unit
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label={`Giảm ${item.name}`}
                        onClick={() => setQuantity(item.slug, item.quantity - 1)}
                        className="flex size-8 items-center justify-center rounded-full border border-brown/15 text-brown hover:bg-cream"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="min-w-5 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Tăng ${item.name}`}
                        onClick={() => setQuantity(item.slug, item.quantity + 1)}
                        disabled={item.quantity >= 10}
                        className="flex size-8 items-center justify-center rounded-full border border-brown/15 text-brown hover:bg-cream disabled:opacity-40"
                      >
                        <Plus className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Xóa ${item.name}`}
                        onClick={() => removeItem(item.slug)}
                        className="flex size-8 items-center justify-center rounded-full text-brown/45 transition hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {items.length > 0 ? (
              <p className="mt-2 border-t border-brown/10 pt-3 text-right text-xs text-brown/55">
                Bạn có thể chỉnh số lượng ở đây
              </p>
            ) : null}
          </div>
        </section>

        <section className="rounded-3xl border border-brown/10 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="font-serif text-lg font-bold">Dạ cho em xin thông tin giao hàng nhé</h2>
          <p className="mt-0.5 text-xs text-brown/55">Các ô có dấu * là bắt buộc.</p>
          {savedInfo ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs text-green-900">
              <span>Thông tin đã lưu trên thiết bị này</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFocus("house_number")}
                  className="font-bold underline underline-offset-2"
                >
                  Sửa
                </button>
                <button
                  type="button"
                  onClick={clearSavedInfo}
                  className="font-semibold text-green-900/75 underline underline-offset-2"
                >
                  Xóa thông tin đã lưu
                </button>
              </div>
            </div>
          ) : null}
          <form className="mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="absolute -left-[10000px] top-auto size-px overflow-hidden">
              <label htmlFor="checkout-website">Để trống trường này</label>
              <input id="checkout-website" tabIndex={-1} autoComplete="off" {...register("website")} />
            </div>
            <label className="block text-xs font-bold text-brown">
              Số điện thoại *
              <input
                type="tel"
                autoComplete="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="09xxxxxxxx"
                aria-invalid={Boolean(errors.phone)}
                {...register("phone")}
                className="mt-1.5 h-11 w-full rounded-xl border border-brown/15 bg-[#fffefa] px-3.5 text-base font-normal outline-none transition placeholder:text-brown/35 focus:border-terracotta focus:ring-2 focus:ring-terracotta/10"
              />
              <FieldError message={errors.phone?.message} />
            </label>
            <label className="block text-xs font-bold text-brown">
              Họ và tên *
              <input
                autoComplete="name"
                placeholder="Nguyễn Thị A"
                aria-invalid={Boolean(errors.customer_name)}
                {...register("customer_name")}
                className="mt-1.5 h-11 w-full rounded-xl border border-brown/15 bg-[#fffefa] px-3.5 text-sm font-normal outline-none transition placeholder:text-brown/35 focus:border-terracotta focus:ring-2 focus:ring-terracotta/10"
              />
              <FieldError message={errors.customer_name?.message} />
            </label>
            <fieldset className="space-y-2">
              <legend className="text-xs font-bold text-brown">Địa chỉ nhận hàng *</legend>
              <p className="text-xs font-normal text-brown/55">
                Vui lòng điền địa chỉ mới để shop giao hàng chính xác.
              </p>
              <label className="block text-xs font-bold text-brown">
                Số nhà, tên đường *
                <input
                  autoComplete="address-line1"
                  placeholder="Ví dụ: 12 Nguyễn Huệ"
                  aria-invalid={Boolean(errors.house_number)}
                  {...register("house_number")}
                  className="mt-1.5 h-11 w-full rounded-xl border border-brown/15 bg-[#fffefa] px-3.5 text-sm font-normal outline-none transition placeholder:text-brown/35 focus:border-terracotta focus:ring-2 focus:ring-terracotta/10"
                />
                <FieldError message={errors.house_number?.message} />
              </label>
              <label className="block text-xs font-bold text-brown">
                Xã/phường *
                <input
                  autoComplete="address-level3"
                  placeholder="Nhập xã/phường"
                  aria-invalid={Boolean(errors.ward)}
                  {...register("ward")}
                  className="mt-1.5 h-11 w-full rounded-xl border border-brown/15 bg-[#fffefa] px-3.5 text-sm font-normal outline-none transition placeholder:text-brown/35 focus:border-terracotta focus:ring-2 focus:ring-terracotta/10"
                />
                <FieldError message={errors.ward?.message} />
              </label>
              <label className="block text-xs font-bold text-brown">
                Tỉnh/thành phố *
                <input
                  autoComplete="address-level1"
                  placeholder="Nhập tỉnh/thành phố"
                  aria-invalid={Boolean(errors.province)}
                  {...register("province")}
                  className="mt-1.5 h-11 w-full rounded-xl border border-brown/15 bg-[#fffefa] px-3.5 text-sm font-normal outline-none transition placeholder:text-brown/35 focus:border-terracotta focus:ring-2 focus:ring-terracotta/10"
                />
                <FieldError message={errors.province?.message} />
              </label>
            </fieldset>
            <label className="block text-xs font-bold text-brown">
              Ghi chú <span className="font-normal text-brown/45">(không bắt buộc)</span>
              <textarea
                rows={1}
                placeholder="Lời nhắn cho shop..."
                {...register("note")}
                className="mt-1.5 w-full resize-y rounded-xl border border-brown/15 bg-[#fffefa] px-3.5 py-2.5 text-sm font-normal outline-none transition placeholder:text-brown/35 focus:border-terracotta focus:ring-2 focus:ring-terracotta/10"
              />
              <FieldError message={errors.note?.message} />
            </label>

            <label className="flex cursor-pointer items-start gap-2 text-xs text-brown/70">
              <input
                type="checkbox"
                checked={saveForLater}
                onChange={(event) => setSaveForLater(event.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-terracotta"
              />
              <span>Lưu thông tin cho lần sau trên thiết bị này</span>
            </label>

            <fieldset>
              <legend className="mb-1.5 text-xs font-bold text-brown">
                Phương thức thanh toán
              </legend>
              <div className="grid gap-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-brown/15 p-2.5 text-xs font-semibold has-[:checked]:border-terracotta has-[:checked]:bg-terracotta/5">
                  <input type="radio" value="cod" {...register("payment_method")} className="accent-terracotta" />
                  Thanh toán khi nhận hàng (COD)
                </label>
              </div>
            </fieldset>

            <div className="rounded-xl bg-cream/70 px-3.5 py-3 text-xs">
              <div className="flex justify-between gap-3 text-brown/65">
                <span>Tạm tính</span><span>{formatPrice(subtotal)}đ</span>
              </div>
              <div className="mt-1.5 flex justify-between gap-3 text-brown/65">
                <span>Phí ship</span><span>{formatPrice(shippingFee)}đ</span>
              </div>
              <div className="mt-2 flex justify-between gap-3 border-t border-brown/10 pt-2 font-extrabold text-brown">
                <span>Tổng cộng</span><span className="text-terracotta">{formatPrice(total)}đ</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-terracotta px-5 text-sm font-bold text-white shadow-lg shadow-terracotta/15 transition hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Đang gửi đơn..." : `Đặt hàng · ${formatPrice(total)}đ`}
              {!submitting ? <ArrowRight className="size-4" /> : null}
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
