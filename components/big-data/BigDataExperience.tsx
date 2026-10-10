"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

import { listenPointer } from "./core/env";
import { listenTouch } from "@/lib/touchAttract";
import { BIG_DATA_CONFIG } from "./bigDataConfig";
import DataPointModule from "./modules/DataPointModule";
import DataStreamsModule from "./modules/DataStreamsModule";
import BigDataModule from "./modules/BigDataModule";
import BigDataVsSmallDataModule from "./modules/BigDataVsSmallDataModule";
import FiveVsModule from "./modules/FiveVsModule";
import ClusteringModule from "./modules/ClusteringModule";
import RelationshipsModule from "./modules/RelationshipsModule";
import InsightsModule from "./modules/InsightsModule";
import FinalTransformationModule from "./modules/FinalTransformationModule";
import "./BigData.css";

// WebGL solo en el cliente; el texto de los módulos sí se renderiza en el servidor
const BigDataCanvas = dynamic(() => import("./BigDataCanvas"), { ssr: false });

/** Sección educativa: Big Data explicado con partículas, módulo por módulo. */
export default function BigDataExperience() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    listenPointer();
    listenTouch();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="big-data"
      className={`bd-section bd-section--${BIG_DATA_CONFIG.theme}`}
      aria-label="Big Data explicado con partículas"
    >
      <header className="bd-intro">
        <div className="bd-intro-copy">
          <span className="bd-eyebrow">Big Data, paso a paso</span>
          <h2 className="bd-intro-title">De un solo dato a decisiones inteligentes</h2>
          <p className="bd-intro-text">
            Cada partícula de esta sección es un Data Point. Baja para ver cómo se generan, se acumulan, se
            procesan y terminan convirtiéndose en información útil.
          </p>
        </div>
      </header>

      <DataPointModule />
      <DataStreamsModule />
      <BigDataModule />
      <BigDataVsSmallDataModule />
      <FiveVsModule />
      <ClusteringModule />
      <RelationshipsModule />
      <InsightsModule />
      <FinalTransformationModule />

      <BigDataCanvas section={sectionRef} />
    </section>
  );
}
