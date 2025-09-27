import Swal from "sweetalert2";

const SweetAlert = ({
  title,
  text = "",
  icon,
  showCancel = false,
  confirmButtonText = "Ya",
  cancelButtonText = "Batal",
}) => {
  return ({ text: dynamicText, onConfirm } = {}) => {
    Swal.fire({
      title,
      text: dynamicText || text,
      icon,
      showCancelButton: showCancel,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText,
      cancelButtonText,
    }).then((result) => {
      if (result.isConfirmed && onConfirm) {
        onConfirm();
      }
    });
  };
};

export default SweetAlert;
