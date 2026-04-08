import React from "react";

const QATicketsTable = ({ data = [] }) => {
  return (
    <div className="grid gap-4">

      {/* Title */}
      <h2 className="text-xl font-semibold text-slate-700">
        QA Tickets by Client
      </h2>

      {/* Card Container */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

        {/* Card Content */}
        <div className="p-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-xs font-bold text-slate-400 uppercase border-b">
                <th className="py-2">Client Name</th>
                <th className="py-2 text-center">High</th>
                <th className="py-2 text-center">Medium</th>
                <th className="py-2 text-center">Low</th>
                <th className="py-2 text-center">Total</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item, index) => {
                const high = item.high || 0;
                const medium = item.medium || 0;
                const low = item.low || 0;
                const total = high + medium + low;

                return (
                  <tr
                    key={index}
                    className="border-b last:border-none text-sm hover:bg-slate-50 transition"
                  >
                    <td className="py-3 font-semibold text-slate-700">
                      {item.clientName}
                    </td>

                    <td className="py-3 text-center text-red-600 font-bold">
                      {high}
                    </td>

                    <td className="py-3 text-center text-amber-500 font-bold">
                      {medium}
                    </td>

                    <td className="py-3 text-center text-emerald-600 font-bold">
                      {low}
                    </td>

                    <td className="py-3 text-center font-bold text-slate-700">
                      {total}
                    </td>
                  </tr>
                );
              })}

              {data.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-sm font-semibold text-slate-400"
                  >
                    No QA tickets available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default QATicketsTable;
