import { Printer, Text, Row, Line } from 'react-thermal-printer';

const ThermalPrinter = ({ 
  cabangName,
  customerName,
  date,
  items,
  total,
  paymentMethod,
  cashAmount,
  change
}) => {
  return (
    <Printer type="epson" width={42}>
      {/* Header */}
      <Text align="center" bold={true}>{cabangName}</Text>
      <Text align="center">Pemesan: {customerName || "Tidak Diketahui"}</Text>
      <Text align="center">{date}</Text>
      <Line />
      
      {/* Items */}
      {items.map((item, index) => (
        <div key={index}>
          <Text>{item.name}</Text>
          <Row left={`${item.quantity} x ${item.price.toLocaleString()}`} right={`${(item.price * item.quantity).toLocaleString()}`} />
        </div>
      ))}
      <Line />
      
      {/* Total & Payment Info */}
      <Row left="Total:" right={`Rp ${total.toLocaleString()}`} />
      
      {paymentMethod === "Cash" && (
        <>
          <Row left="Tunai:" right={`Rp ${parseFloat(cashAmount).toLocaleString()}`} />
          <Row left="Kembali:" right={`Rp ${change > 0 ? change.toLocaleString() : 0}`} />
        </>
      )}
      
      <Text align="center">Metode Pembayaran: {paymentMethod}</Text>
      <Line />
      <Text align="center">Terima kasih atas kunjungan Anda</Text>
      
      {/* Add space at the end for cutting */}
      <Text>{"\n\n\n"}</Text>
    </Printer>
  );
};

export default ThermalPrinter;