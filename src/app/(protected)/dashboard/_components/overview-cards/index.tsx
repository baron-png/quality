"use client";

import { compactFormat } from "@/lib/format-number";
import { getOverviewData } from "../../fetch";
import { OverviewCard } from "./card";
import * as icons from "./icons";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-context";

// ...rest of your code...
const services = [
  { label: "Audit Management", icon: icons.Audit },
  { label: "Document Control", icon: icons.Document },
  { label: "Risk Management", icon: icons.Risk },
  { label: "Student Management", icon: icons.Student },
];

function ServicesCard() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % services.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  const ServiceIcon = services[index].icon;

  return (
    <OverviewCard
      label="Products"
      data={{ value: services[index].label, growthRate: 0 }}
      Icon={ServiceIcon}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={services[index].label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-lg font-semibold text-center"
        >
          {services[index].label}
        </motion.div>
      </AnimatePresence>
    </OverviewCard>
  );
}

export function OverviewCardsGroup() {
  const { token } = useAuth();
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    if (!token) return;
    getOverviewData(token)
      .then(setOverview)
      .catch((err) => {
        // Optionally handle error
        setOverview(null);
      });
  }, [token]);

  if (!overview) return <div>Loading...</div>;

  const { institutions, users, newTenants } = overview;

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <OverviewCard
        label="Total Institutions"
        data={{
          ...institutions,
          value: compactFormat(institutions.value),
          growthRate: institutions.growthRate ?? 0,
        }}
        Icon={icons.Institution}
      />
      <OverviewCard
        label="New Clients"
        data={{
          ...newTenants,
          value: compactFormat(newTenants.value),
          growthRate: newTenants.growthRate ?? 0,
        }}
        Icon={icons.NewClients}
      />
      <OverviewCard
        label="Total Users"
        data={{
          ...users,
          value: compactFormat(users.value),
          growthRate: users.growthRate ?? 0,
        }}
        Icon={icons.Users}
      />
      <ServicesCard />
    </div>
  );
}