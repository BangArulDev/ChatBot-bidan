import React from "react";
import {
  UsersIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const stats = [
  {
    name: "Total Pengguna",
    stat: "745",
    icon: UsersIcon,
    change: "12%",
    changeType: "increase",
  },
  {
    name: "Total Chat",
    stat: "3,423",
    icon: ChatBubbleLeftRightIcon,
    change: "2.5%",
    changeType: "increase",
  },
  {
    name: "Tingkat Kepuasan",
    stat: "98.5%",
    icon: CheckCircleIcon,
    change: "4.1%",
    changeType: "increase",
  },
  {
    name: "Laporan Masalah",
    stat: "23",
    icon: ExclamationTriangleIcon,
    change: "3%",
    changeType: "decrease",
  },
];

export default function Dashboard() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Ringkasan performa chatbot dalam 30 hari terakhir
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6"
          >
            <dt>
              <div className="absolute rounded-md bg-pink-500 p-3">
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">
                {item.stat}
              </p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  item.changeType === "increase"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {item.changeType === "increase" ? "↑" : "↓"} {item.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Grafik aktivitas chat */}
        <div className="rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Aktivitas Chat
            </h3>
            {/* Tambahkan komponen grafik di sini */}
            <div className="mt-4 h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
              <p className="text-gray-500">Grafik Aktivitas Chat</p>
            </div>
          </div>
        </div>

        {/* Topik yang sering ditanyakan */}
        <div className="rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Topik Populer
            </h3>
            <div className="mt-4">
              <div className="space-y-4">
                {[
                  { topic: "Mual dan Muntah", count: 245 },
                  { topic: "Nutrisi Kehamilan", count: 189 },
                  { topic: "Jadwal Kontrol", count: 156 },
                  { topic: "Keluhan Trimester 1", count: 132 },
                  { topic: "Suplemen Vitamin", count: 98 },
                ].map((item) => (
                  <div
                    key={item.topic}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {item.topic}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({item.count})
                        </span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-pink-500 h-2 rounded-full"
                          style={{
                            width: `${(item.count / 245) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
