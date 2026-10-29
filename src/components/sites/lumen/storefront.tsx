"use client";

import { useState } from "react";
import { Catalog } from "./catalog";
import { Guarantee } from "./guarantee";
import { Hero } from "./hero";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function Storefront() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  return (
    <>
      <SiteHeader query={query} onSearch={setQuery} onSelectCategory={setCategory} />
      <main>
        <Hero />
        <Guarantee />
        <Catalog
          query={query}
          onQueryChange={setQuery}
          category={category}
          onCategoryChange={setCategory}
        />
      </main>
      <SiteFooter />
    </>
  );
}
