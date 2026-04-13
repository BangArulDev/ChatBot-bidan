import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  {
    name: "Riwayat Chat",
    href: "/chat-history",
    icon: ChatBubbleLeftRightIcon,
  },
  { name: "Respons Bot", href: "/bot-responses", icon: CogIcon },
  { name: "Analitik", href: "/analytics", icon: ChartBarIcon },
  { name: "Pengaturan", href: "/settings", icon: AdjustmentsHorizontalIcon },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <div className="flex flex-shrink-0 items-center px-4">
            <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center">
              <span className="text-pink-600 font-bold text-xl">B</span>
            </div>
            <span className="ml-3 text-lg font-semibold text-gray-900">
              Bidan Sinta
            </span>
          </div>
          <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-pink-50 text-pink-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-6 w-6 flex-shrink-0 ${
                      isActive
                        ? "text-pink-600"
                        : "text-gray-400 group-hover:text-gray-500"
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
          <div className="group block w-full flex-shrink-0">
            <div className="flex items-center">
              <div className="inline-block h-9 w-9 rounded-full">
                <img
                  className="h-9 w-9 rounded-full"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  Admin Bidan
                </p>
                <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                  Keluar
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
