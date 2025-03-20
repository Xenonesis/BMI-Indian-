document.querySelectorAll('input[name="height-unit"]').forEach(radio => {
  radio.addEventListener('change', () => {
    if (radio.value === 'ft_in' && radio.checked) {
      document.getElementById('height-cm-group').classList.add('hidden');
      document.getElementById('height-cm').removeAttribute('required');
      document.getElementById('height-ftin-group').classList.remove('hidden');
      document.getElementById('height-feet').setAttribute('required', 'required');
      document.getElementById('height-inches').setAttribute('required', 'required');
    } else {
      document.getElementById('height-ftin-group').classList.add('hidden');
      document.getElementById('height-feet').removeAttribute('required');
      document.getElementById('height-inches').removeAttribute('required');
      document.getElementById('height-cm-group').classList.remove('hidden');
      document.getElementById('height-cm').setAttribute('required', 'required');
    }
  });
});
