'use client';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useTable, useSortBy, usePagination } from 'react-table';
import { FaSortUp, FaSortDown, FaSort, FaChevronLeft, FaChevronRight, FaStepBackward, FaStepForward } from 'react-icons/fa';

const UploadExcel = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [fontsize, setFontsize] = useState("text-md")

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true });

      const headers = jsonData[0].map((header) => ({
        Header: header,
        accessor: header,
      }));

      const dateRegex = /^(\d{1,2}[-/]\d{1,2}[-/]\d{4})$/;

      const rows = jsonData.slice(1).map((row) => {
        const rowData = {};
        headers.forEach((col, index) => {
          let cellValue = row[index];

          if (typeof cellValue === 'number' && cellValue > 10000 && cellValue < 60000) {
            const excelDate = new Date((cellValue - 25569) * 86400 * 1000);
            cellValue = excelDate.toLocaleDateString();
          }

          if (typeof cellValue === 'string' && dateRegex.test(cellValue)) {
            rowData[col.accessor] = cellValue;
          } else {
            rowData[col.accessor] = cellValue;
          }
        });
        return rowData;
      });

      setColumns(headers);
      setData(rows);
    };

    reader.readAsBinaryString(file);
  };



  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 20 },
    },
    useSortBy,
    usePagination
  );


  return (
    <div className="p-5">
      <input
        type="file"
        id="file"
        accept=".xls,.xlsx"
        onChange={handleFileUpload}
        className="bg-black text-center block font-bold w-full mx-auto my-5 lg:w-1/2 text-lg text-orange-600 border border-gray-300 rounded-lg cursor-pointer"
        required
      />

      {data.length > 0 ? (
        <div>
          <table {...getTableProps()} className="w-full mt-5 table-auto border-collapse border border-gray-300">
            <thead className="bg-orange-600 text-black">
              
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()} className="border-b-2 border-gray-200" key={headerGroup.id}>
                  {headerGroup.headers.map((column) => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className="py-3 px-4 lg:px-3 cursor-pointer text-center"
                      key={column.id} // Add key here
                    >
                      <span className='flex flex-row justify-center items-center'>
                        {column.render('Header')}
                        <span className="ml-2 inline-block ">
                          {column.isSorted ? (
                            column.isSortedDesc ? (
                              <FaSortDown />
                            ) : (
                              <FaSortUp />
                            )
                          ) : (
                            <FaSort />
                          )}
                        </span>
                      </span>
                    </th>
                  ))}
                </tr>
              ))}

            </thead>
            <tbody {...getTableBodyProps()} className={`text-center ${fontsize}`}>
              {page.map((row, i) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} className="border-b border-gray-200">
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()} className="p-3">
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex lg:items-center justify-between mt-5 flex-col gap-2 lg:flex-row lg:gap-0 items-start">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
                className={`px-3 py-1 rounded-md ${canPreviousPage ? 'bg-orange-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                <FaStepBackward />
              </button>
              <button
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                className={`px-3 py-1 rounded-md ${canPreviousPage ? 'bg-orange-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={() => nextPage()}
                disabled={!canNextPage}
                className={`px-3 py-1 rounded-md ${canNextPage ? 'bg-orange-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                <FaChevronRight />
              </button>
              <button
                onClick={() => gotoPage(pageOptions.length - 1)}
                disabled={!canNextPage}
                className={`px-3 py-1 rounded-md ${canNextPage ? 'bg-orange-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                <FaStepForward />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <span>
                Page{' '}
                <strong>
                  {pageIndex + 1} of {pageOptions.length}
                </strong>
              </span>
              <span>| Go to page:</span>
              <input
                type="number"
                defaultValue={pageIndex + 1}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  gotoPage(page);
                }}
                className="w-16 p-1 text-black font-extrabold text-md text-center border border-white bg-orange-600 rounded-md focus:outline-none"
              />
            </div>

            <span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="mr-2 p-2 border border-white bg-orange-600 rounded-md focus:outline-none text-black font-semibold"
              >
                {[10, 20, 30, 40, 50].map((size) => (
                  <option key={size} value={size}>
                    Show {size}
                  </option>
                ))}
              </select>

              <select
                value={fontsize}
                onChange={(e) => setFontsize(e.target.value)}
                className="p-2 border border-white bg-orange-600 rounded-md focus:outline-none text-black font-semibold"
              >
                {["text-md", "text-xl", "text-2xl"].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </span>

          </div>
        </div>
      ) : (<div className='flex justify-center items-center text-xl lg:text-2xl text-orange-600'> Upload File </div>
      )}
    </div>
  );
};

export default UploadExcel;
