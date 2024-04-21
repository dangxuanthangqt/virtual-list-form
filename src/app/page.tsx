"use client";

import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useRef, useState } from "react";
import { z } from "zod";
import { useVirtualizer } from "@tanstack/react-virtual";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  items: z.array(z.object({ quantity: z.number().max(10, "error message") })),
});

type FormValues = z.infer<typeof schema>;

export default function Home() {
  const parentRef = useRef(null);

  const [items] = useState(() =>
    Array.from(Array(1000).keys()).map((i) => ({
      title: `List ${i}`,
      quantity: i + 1,
    }))
  );

  const { control, handleSubmit, getValues, formState, setValue } =
    useForm<FormValues>({
      defaultValues: {
        items: items.map((item) => ({ quantity: item.quantity })),
      },
      mode: "onBlur",
      resolver: zodResolver(schema),
    });

  const { errors } = formState;

  const { fields, append, remove } = useFieldArray({
    name: "items",
    control,
  });

  const rowVirtualizer = useVirtualizer({
    count: fields.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 2,
  });

  const onClick = () => {
    setValue(`items.${800}.quantity`, 1000, { shouldValidate: true });
  };

  return (
    <main className="flex min-h-screen bg-slate-500 flex-col items-center p-24">
      <button className="bg-orange-500 rounded-md p-4 mb-4" onClick={onClick}>
        test
      </button>
      <form>
        <div ref={parentRef} className="overflow-auto h-[600px] w-[600px]">
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer
              .getVirtualItems()
              .map(({ index, start, size, key }) => {
                const error = errors.items?.[index]?.quantity?.message;
                return (
                  <div
                    key={key}
                    className="top-0 left-0 absolute w-full flex items-center p-2"
                    style={{
                      height: size,
                      transform: `translateY(${start}px)`,
                    }}
                  >
                    <div className="w-[400px]">
                      <Controller
                        control={control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <input {...field} className="w-full p-1" />
                        )}
                      ></Controller>
                      <p className="text-red-600 mt-2">{error}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="bg-red-500 text-white rounded-md p-2 ml-2"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      </form>
    </main>
  );
}
