import { head } from "lodash-es";
import DataTable from "react-data-table-component";
import { useTranslation } from "react-i18next";
import { RawResult } from "@/types";
import Icon from "../Icon";

interface Props {
  rawResults: RawResult[];
}

const DataTableView = (props: Props) => {
  const { rawResults } = props;
  const { t } = useTranslation();
  const columns = Object.keys(head(rawResults) || {}).map((key) => {
    return {
      name: key,
      sortable: true,
      selector: (row: any) => (row[key] === null ? "" : row[key]),
      cell: (row: any) => {
        const value = row[key];
        if (value === null) {
          return <span style={{ color: "#B2B8C168" }}>null</span>;
        }
        if (typeof value === "object") {
          return <span style={{ color: "#B2B8C168" }}>[object]</span>;
        }
        return (
          <div
            style={{
              maxWidth: "240px",
              maxHeight: "50px",
              overflow: "auto",
              whiteSpace: "normal",
              borderRadius: "4px",
            }}
            title={value}
          >
            {value}
          </div>
        );
      },
    };
  });

  return rawResults.length === 0 ? (
    <div className="w-full flex flex-col justify-center items-center py-6 pt-10">
      <Icon.BsBox2 className="w-7 h-auto opacity-70" />
      <span className="text-sm font-mono text-gray-500 mt-2">{t("execution.message.no-data")}</span>
    </div>
  ) : (
    <div style={{ overflowX: "scroll", width: "100%" }}>
      {" "}
      {/* for scroll x container */}
      <DataTable
        className="w-full border !rounded-lg dark:border-zinc-700"
        columns={columns}
        data={rawResults}
        fixedHeader
        pagination
        responsive
      />
    </div>
  );
};

export default DataTableView;
