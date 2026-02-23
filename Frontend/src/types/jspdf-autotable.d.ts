declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  interface UserOptions {
    head?: any[][];
    body?: any[][];
    foot?: any[][];
    startY?: number;
    theme?: 'striped' | 'grid' | 'plain';
    headStyles?: any;
    footStyles?: any;
    styles?: any;
    columnStyles?: any;
    margin?: any;
    pageBreak?: string;
    rowPageBreak?: string;
    tableWidth?: string | number;
    showHead?: boolean | 'everyPage' | 'firstPage' | 'never';
    showFoot?: boolean | 'everyPage' | 'lastPage' | 'never';
    tableLineColor?: number | number[];
    tableLineWidth?: number;
  }

  function autoTable(doc: jsPDF, options: UserOptions): void;

  export default autoTable;
}
