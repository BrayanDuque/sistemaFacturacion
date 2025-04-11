import { useState } from "react";

export default function Factura() {
  // Estado para almacenar la lista de facturas
  const [invoices, setInvoices] = useState([]);
  // Estado para controlar la vista actual (lista o formulario de creación)
  const [currentView, setCurrentView] = useState("list");
  // Estado para almacenar la factura seleccionada para ver detalles
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Estado para almacenar el formulario de creación de factura, se crea un objeto con los campos necesarios
  // Se inicializa con valores vacíos y un total de 0
  const [invoiceForm, setInvoiceForm] = useState({
    numero: "",
    fecha: "",
    cliente: "",
    vendedor: "",
    total: 0,
  });

  // estado para los detalles de la lista, se crea un array con un objeto que contiene los campos necesarios
  // Se inicializa con valores vacíos y un subtotal de 0
  const [invoiceDetails, setInvoiceDetails] = useState([
    { descripcion: "", cantidad: 1, precioUnitario: 0, subtotal: 0 },
  ]);

  // estado de errores, se crea un objeto vacío para almacenar los errores de validación
  const [errors, setErrors] = useState({});

  // Manejar cambios en el formulario de la factura
  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setInvoiceForm({
      ...invoiceForm,
      [name]: value,
    });
  };

  // Manejar cambios en los detalles de la factura
  const handleDetailChange = (index, e) => {
    const { name, value } = e.target;
    const updatedDetails = [...invoiceDetails];

    updatedDetails[index] = {
      ...updatedDetails[index],
      [name]: value,
    };

    // Calcular subtotal si se modifica cantidad o precio unitario
    // Se asegura de que el subtotal se calcule correctamente al cambiar cantidad o precio unitario
    if (name === "cantidad" || name === "precioUnitario") {
      const cantidad =
        name === "cantidad"
          ? Number.parseFloat(value) || 0
          : Number.parseFloat(updatedDetails[index].cantidad) || 0;
      const precio =
        name === "precioUnitario"
          ? Number.parseFloat(value) || 0
          : Number.parseFloat(updatedDetails[index].precioUnitario) || 0;
      updatedDetails[index].subtotal = cantidad * precio;
    }

    setInvoiceDetails(updatedDetails);

    // el total de la factura
    const total = updatedDetails.reduce(
      (sum, item) => sum + (item.subtotal || 0),
      0
    );
    setInvoiceForm({
      ...invoiceForm,
      total,
    });
  };

  // añadir una nueva línea de detalle
  const addDetail = () => {
    setInvoiceDetails([
      ...invoiceDetails,
      { descripcion: "", cantidad: 1, precioUnitario: 0, subtotal: 0 },
    ]);
  };

  // remover una línea de detalle
  const removeDetail = (index) => {
    if (invoiceDetails.length > 1) {
      const updatedDetails = invoiceDetails.filter((_, i) => i !== index);
      setInvoiceDetails(updatedDetails);

      // subir el total
      const total = updatedDetails.reduce(
        (sum, item) => sum + (item.subtotal || 0),
        0
      );
      setInvoiceForm({
        ...invoiceForm,
        total,
      });
    }
  };

  // Validar el formulario antes de enviar
  // Se asegura de que todos los campos obligatorios estén completos y que los detalles sean válidos
  const validateForm = () => {
    // Se crea un objeto vacío para almacenar los errores
    const newErrors = {};
    //Se valida de que el número de factura no esté vacío
    if (!invoiceForm.numero.trim()) {
      newErrors.numero = "El número de factura es obligatorio";
    }
    // Se valida de que la fecha no esté vacía
    if (!invoiceForm.fecha) {
      newErrors.fecha = "La fecha es obligatoria";
    }
    // Se valida de que el cliente no esté vacío
    if (!invoiceForm.cliente.trim()) {
      newErrors.cliente = "El nombre del cliente es obligatorio";
    }
    // Se valida de que el vendedor no esté vacío
    if (!invoiceForm.vendedor.trim()) {
      newErrors.vendedor = "El nombre del vendedor es obligatorio";
    }

    // Validacion de detalles
    const detailErrors = [];
    // Se recorre la lista de detalles y se valida cada uno
    invoiceDetails.forEach((detail, index) => {
      // Se crea un objeto vacío para almacenar los errores de cada detalle
      const itemErrors = {};
      // Se valida de que la descripción no esté vacía
      if (!detail.descripcion.trim()) {
        itemErrors.descripcion = "La descripción es obligatoria";
      }
      // Se valida de que la cantidad sea mayor a 0
      if (!detail.cantidad || detail.cantidad <= 0) {
        itemErrors.cantidad = "La cantidad debe ser mayor a 0";
      }
      // Se valida de que el precio unitario sea mayor a 0
      if (!detail.precioUnitario || detail.precioUnitario <= 0) {
        itemErrors.precioUnitario = "El precio debe ser mayor a 0";
      }
      // Se valida de que el subtotal sea mayor a 0
      if (Object.keys(itemErrors).length > 0) {
        detailErrors[index] = itemErrors;
      }
    });
    // Si hay errores en los detalles, se añaden al objeto de errores
    if (detailErrors.length > 0) {
      newErrors.details = detailErrors;
    }
    // Si hay errores, se actualiza el estado de errores y se retorna false
    setErrors(newErrors);
    // Si no hay errores, se retorna true
    return Object.keys(newErrors).length === 0;
  };

  // enviar formulario
  const handleSubmit = (e) => {
    // Se previene el comportamiento por defecto del formulario
    e.preventDefault();
    // Se valida el formulario antes de enviar
    if (validateForm()) {
      // Se crea una nueva factura con los datos del formulario y los detalles
      const newInvoice = {
        ...invoiceForm,
        // Se genera un ID único para la factura usando Date.now()
        id: Date.now(),
        // Se convierte la fecha a un formato ISO y se extrae la parte de la fecha
        fecha: new Date(invoiceForm.fecha).toISOString().split("T")[0],
        // Se convierte el total a un número con dos decimales
        detalles: [...invoiceDetails],
      };

      // Se añade la nueva factura a la lista de facturas
      setInvoices([...invoices, newInvoice]);

      //resetear o limpiar formulario
      setInvoiceForm({
        numero: "",
        fecha: "",
        cliente: "",
        vendedor: "",
        total: 0,
      });
      // Se reinicia la lista de detalles a un solo detalle vacío
      setInvoiceDetails([
        { descripcion: "", cantidad: 1, precioUnitario: 0, subtotal: 0 },
      ]);

      // Se cambia la vista actual a "list" y se establece la factura seleccionada
      setCurrentView("list");
    }
  };

  // ver detalles de la factura
  const viewInvoiceDetails = (invoice) => {
    // Se cambia la vista actual a "list" y se establece la factura seleccionada
    setSelectedInvoice(invoice);
  };

  // renderización si hay errores
  const renderError = (error) => {
    return error ? (
      <div className="text-red-500 text-sm mt-1">{error}</div>
    ) : null;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        Sistema de Gestión de Facturas
      </h1>

      {/* Navigacion */}
      <div className="flex justify-between mb-6">
        {/* el titulo dependera de la vista que tengamos seleccionada */}
        {/* Si la vista es "list" se mostrara "Lista de Facturas" y si es "create" se mostrara "Crear Nueva Factura" */}
        <h2 className="text-xl font-semibold">
          {currentView === "list" ? "Lista de Facturas" : "Factura Nueva"}
        </h2>
        {/* Botón para alternar entre la vista de lista y la vista de creación de factura */}
        <button
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white font-medium"
          onClick={() => {
            if (currentView === "list") {
              setCurrentView("create");
              setSelectedInvoice(null);
            } else {
              setCurrentView("list");
            }
          }}
        >
          {currentView === "list" ? "Crear Factura" : "Ver Facturas"}
        </button>
      </div>

      {/* creacion de factura */}
      {currentView === "create" && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-2 font-medium">
                Número de Factura
              </label>
              <input
                type="text"
                name="numero"
                value={invoiceForm.numero}
                onChange={handleInvoiceChange}
                className="w-full p-2 border rounded"
              />
              {renderError(errors.numero)}
            </div>

            <div>
              <label className="block mb-2 font-medium">Fecha</label>
              <input
                type="date"
                name="fecha"
                value={invoiceForm.fecha}
                onChange={handleInvoiceChange}
                className="w-full p-2 border rounded"
              />
              {renderError(errors.fecha)}
            </div>

            <div className="md:col-span-2">
              <label className="block mb-2 font-medium">Cliente</label>
              <input
                type="text"
                name="cliente"
                value={invoiceForm.cliente}
                onChange={handleInvoiceChange}
                className="w-full p-2 border rounded"
              />
              {renderError(errors.cliente)}
            </div>

            <div className="md:col-span-2">
              <label className="block mb-2 font-medium">Vendedor</label>
              <input
                type="text"
                name="vendedor"
                value={invoiceForm.vendedor}
                onChange={handleInvoiceChange}
                className="w-full p-2 border rounded"
              />
              {renderError(errors.vendedor)}
            </div>
          </div>

          <h3 className="text-lg font-medium mb-4">Detalles de la Factura</h3>

          <div className="mb-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Descripción</th>
                  <th className="p-2 text-left">Cantidad</th>
                  <th className="p-2 text-left">Precio Unitario</th>
                  <th className="p-2 text-left">Subtotal</th>
                  <th className="p-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {invoiceDetails.map((detail, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">
                      <input
                        type="text"
                        name="descripcion"
                        value={detail.descripcion}
                        onChange={(e) => handleDetailChange(index, e)}
                        className="w-full p-1 border rounded"
                      />
                      {errors.details &&
                        errors.details[index] &&
                        renderError(errors.details[index].descripcion)}
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        name="cantidad"
                        value={detail.cantidad}
                        onChange={(e) => handleDetailChange(index, e)}
                        className="w-full p-1 border rounded"
                        min="1"
                      />
                      {errors.details &&
                        errors.details[index] &&
                        renderError(errors.details[index].cantidad)}
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        name="precioUnitario"
                        value={detail.precioUnitario}
                        onChange={(e) => handleDetailChange(index, e)}
                        className="w-full p-1 border rounded"
                        min="0"
                        step="0.01"
                      />
                      {errors.details &&
                        errors.details[index] &&
                        renderError(errors.details[index].precioUnitario)}
                    </td>
                    <td className="p-2">{detail.subtotal.toFixed(2)}</td>
                    <td className="p-2">
                      <button
                        type="button"
                        onClick={() => removeDetail(index)}
                        className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-white" 
                        disabled={invoiceDetails.length === 1}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex justify-between">
              <button
                type="button"
                onClick={addDetail}
                className="bg-green-500 hover:bg-green-600  px-4 py-2 rounded text-white font-medium"
              >
                Agregar nuevo producto
              </button>

              <div className="text-xl font-bold">
                Total: ${invoiceForm.total.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="mt-6 text-right">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600  px-6 py-2 rounded font-medium text-white"
            >
              Guardar Factura
            </button>
          </div>
        </form>
      )}

      {/* Lista de facturas */}
      {currentView === "list" && !selectedInvoice && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          {invoices.length === 0 ? (
            <p className="text-center text-gray-500">
              No hay facturas registradas
            </p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Número</th>
                  <th className="p-2 text-left">Fecha</th>
                  <th className="p-2 text-left">Cliente</th>
                  <th className="p-2 text-left">Vendedor</th>
                  <th className="p-2 text-left">Total</th>
                  <th className="p-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{invoice.numero}</td>
                    <td className="p-2">{invoice.fecha}</td>
                    <td className="p-2">{invoice.cliente}</td>
                    <td className="p-2">{invoice.vendedor}</td>
                    <td className="p-2">${invoice.total.toFixed(2)}</td>
                    <td className="p-2">
                      <button
                        onClick={() => viewInvoiceDetails(invoice)}
                        className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-white"
                      >
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* lista de detalles de la factura */}
      {currentView === "list" && selectedInvoice && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded text-white"
            >
              Volver a la Lista
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="font-medium">Número de Factura:</p>
              <p>{selectedInvoice.numero}</p>
            </div>
            <div>
              <p className="font-medium">Fecha:</p>
              <p>{selectedInvoice.fecha}</p>
            </div>
            <div className="md:col-span-2">
              <p className="font-medium">Cliente:</p>
              <p>{selectedInvoice.cliente}</p>
            </div>
            <div className="md:col-span-2">
              <p className="font-medium">Vendedor:</p>
              <p>{selectedInvoice.vendedor}</p>
            </div>
          </div>

          <h3 className="text-lg font-medium mb-4">Detalles de la Factura</h3>

          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Descripción</th>
                <th className="p-2 text-left">Cantidad</th>
                <th className="p-2 text-left">Precio Unitario</th>
                <th className="p-2 text-left">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {selectedInvoice.detalles.map((detail, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{detail.descripcion}</td>
                  <td className="p-2">{detail.cantidad}</td>
                  <td className="p-2">
                    ${Number.parseFloat(detail.precioUnitario).toFixed(2)}
                  </td>
                  <td className="p-2">
                    ${Number.parseFloat(detail.subtotal).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td className="p-2" colSpan="3" align="right">
                  Total:
                </td>
                <td className="p-2">${selectedInvoice.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
