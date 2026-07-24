type FormControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const SKIPPED_INPUT_TYPES = new Set(['checkbox', 'radio', 'file', 'submit', 'button', 'reset']);

/**
 * Browsers and password managers can fill inputs without firing the events React
 * listens to, so form state (react-hook-form) keeps its initial empty value and
 * validation fails although the fields visually contain data.
 *
 * Re-dispatches native `input`/`change` events for every filled control. React
 * tracks the last value it knows per node and ignores events where nothing
 * changed, so only the out-of-sync (autofilled) controls actually update.
 */
export const replayAutofill = (form: HTMLFormElement | null): void => {
  if (!form) {
    return;
  }

  const controls = form.querySelectorAll<FormControl>('input[name], select[name], textarea[name]');

  controls.forEach((control) => {
    if (control instanceof HTMLInputElement && SKIPPED_INPUT_TYPES.has(control.type)) {
      return;
    }

    if (!control.value) {
      return;
    }

    control.dispatchEvent(new Event('input', { bubbles: true }));
    control.dispatchEvent(new Event('change', { bubbles: true }));
  });
};
