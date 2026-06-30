// src/components/ModalConfirmacion.jsx
// MedConnect — Componente Modal de Confirmación de Cita
// Ref: Arquitectura de Software — Sección 6.3 | SRS RF-06, RF-07

import React from 'react';

/**
 * Modal de confirmación final antes de registrar la cita en base de datos.
 * @param {{ show: boolean, onClose: () => void, onConfirm: () => void, loading: boolean, datosCita: { medicoNombre: string, especialidadNombre: string, fechaFormateada: string, hora: string } }} props
 */
export default function ModalConfirmacion({ show, onClose, onConfirm, loading, datosCita }) {
  if (!show) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1050
    },
    modal: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      width: '100%',
      maxWidth: '450px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      overflow: 'hidden',
      border: 'none'
    },
    body: {
      padding: '2rem'
    },
    btnConfirm: {
      borderRadius: '30px',
      fontWeight: '600',
      padding: '0.6rem 1.5rem',
      backgroundColor: '#3182ce',
      borderColor: '#3182ce',
      color: '#ffffff'
    },
    btnCancel: {
      borderRadius: '30px',
      fontWeight: '600',
      padding: '0.6rem 1.5rem',
      border: '1px solid #e2e8f0',
      backgroundColor: '#ffffff',
      color: '#4a5568'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()} className="animate__animated animate__fadeInUp">
        <div style={styles.body}>
          <div className="text-center mb-4">
            <span style={{ fontSize: '3rem' }}>📅</span>
            <h3 className="h5 fw-bold mt-2">Confirmar cita médica</h3>
            <p className="text-muted small">Revise los datos antes de confirmar su cita</p>
          </div>

          <div className="card bg-light p-3 border-0 rounded-3 mb-4">
            <table className="table table-borderless table-sm mb-0 small">
              <tbody>
                <tr>
                  <td className="text-muted py-1">Médico:</td>
                  <td className="fw-bold text-dark py-1">{datosCita?.medicoNombre}</td>
                </tr>
                <tr>
                  <td className="text-muted py-1">Especialidad:</td>
                  <td className="fw-semibold text-primary py-1">{datosCita?.especialidadNombre}</td>
                </tr>
                <tr>
                  <td className="text-muted py-1">Fecha:</td>
                  <td className="fw-semibold text-dark py-1">{datosCita?.fechaFormateada}</td>
                </tr>
                <tr>
                  <td className="text-muted py-1">Hora:</td>
                  <td className="fw-semibold text-dark py-1">{datosCita?.hora}</td>
                </tr>
                <tr>
                  <td className="text-muted py-1">Modalidad:</td>
                  <td className="fw-semibold text-success py-1">Presencial</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="alert alert-info py-2 px-3 small rounded-3 mb-4 border-0">
            <div className="d-flex align-items-center mb-1">
              <span className="me-2">📧</span>
              <span>Se enviará confirmación por correo (RF-07)</span>
            </div>
            <div className="d-flex align-items-center">
              <span className="me-2">⏰</span>
              <span>Recordatorio 24h antes — Nodemailer</span>
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn w-50"
              style={styles.btnCancel}
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              className="btn w-50"
              style={styles.btnConfirm}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Confirmando...
                </>
              ) : (
                'Confirmar cita'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
