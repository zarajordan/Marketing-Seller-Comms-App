import React from 'react';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Button,
} from '@carbon/react';

const EventsTab = () => {
  const headers = [
    { key: 'name', header: 'Event Name' },
    { key: 'date', header: 'Date' },
    { key: 'location', header: 'Location' },
    { key: 'type', header: 'Type' },
    { key: 'actions', header: 'Actions' },
  ];

  const rows = [
    {
      id: '1',
      name: 'IBM Think Conference',
      date: 'May 2026',
      location: 'Boston, MA',
      type: 'Conference',
    },
    {
      id: '2',
      name: 'UKI Marketing Webinar',
      date: 'April 2026',
      location: 'Virtual',
      type: 'Webinar',
    },
    {
      id: '3',
      name: 'Partner Summit',
      date: 'June 2026',
      location: 'London, UK',
      type: 'Summit',
    },
  ];

  return (
    <div className="events-tab">
      <div className="events-header">
        <h2>🎯 Event Library</h2>
        <p>Browse and add events to your communications</p>
      </div>

      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader {...getHeaderProps({ header })}>
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow {...getRowProps({ row })}>
                  {row.cells.map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.info.header === 'actions' ? (
                        <Button size="sm" kind="ghost">
                          Add to Comm
                        </Button>
                      ) : (
                        cell.value
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
    </div>
  );
};

export default EventsTab;

// Made with Bob
