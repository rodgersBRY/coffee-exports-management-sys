import type { FilterConfig, FieldConfig } from "@/components/data/ResourcePanel";

export type PanelConfig = {
  title: string;
  description: string;
  listEndpoint: string;
  createEndpoint: string;
  sortBy: string;
  createFields: FieldConfig[];
  filters?: FilterConfig[];
};

export const masterPanels: PanelConfig[] = [
  {
    title: "Suppliers",
    description: "Manage auction agents, mills, and direct suppliers.",
    listEndpoint: "master/suppliers",
    createEndpoint: "master/suppliers",
    sortBy: "created_at",
    createFields: [
      { name: "name", label: "Name", type: "text", required: true },
      {
        name: "type",
        label: "Type",
        type: "select",
        required: true,
        options: [
          { label: "auction_agent", value: "auction_agent" },
          { label: "mill", value: "mill" },
          { label: "farmer", value: "farmer" },
          { label: "other", value: "other" }
        ]
      },
      { name: "country", label: "Country", type: "text" }
    ],
    filters: [
      { name: "type", label: "Filter type" },
      { name: "country", label: "Filter country" }
    ]
  },
  {
    title: "Buyers",
    description: "Commercial buyers and destinations.",
    listEndpoint: "master/buyers",
    createEndpoint: "master/buyers",
    sortBy: "created_at",
    createFields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "country", label: "Country", type: "text" }
    ],
    filters: [{ name: "country", label: "Filter country" }]
  },
  {
    title: "Warehouses",
    description: "Warehouse definitions and physical locations.",
    listEndpoint: "master/warehouses",
    createEndpoint: "master/warehouses",
    sortBy: "created_at",
    createFields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "location", label: "Location", type: "text" }
    ],
    filters: [{ name: "location", label: "Filter location" }]
  },
  {
    title: "Grades",
    description: "Coffee grades used in contracts and lots.",
    listEndpoint: "master/grades",
    createEndpoint: "master/grades",
    sortBy: "created_at",
    createFields: [
      { name: "code", label: "Code", type: "text", required: true },
      { name: "description", label: "Description", type: "text" }
    ],
    filters: [{ name: "code", label: "Filter code" }]
  },
  {
    title: "Bag Types",
    description: "Bag definitions with standard weights.",
    listEndpoint: "master/bag-types",
    createEndpoint: "master/bag-types",
    sortBy: "created_at",
    createFields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "weight_kg", label: "Weight kg", type: "number", required: true }
    ]
  }
];
