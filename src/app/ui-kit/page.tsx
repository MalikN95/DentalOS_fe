'use client';

import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  EmptyState,
  Modal,
  NotificationBadge,
  RadioButton,
  SearchSelect,
  SwitchToggle,
  TextField,
} from '@/components/ui';
import { CURRENCY_OPTIONS, LANGUAGE_OPTIONS, TIMEZONE_OPTIONS } from '@/helpers/locale-options';
import styles from './page.module.css';

const MODAL_DEMO_FIELDS = Array.from({ length: 12 }, (_, index) => `Поле ${index + 1}`);

const UiKitPage = () => {
  const [checked, setChecked] = useState(true);
  const [radioValue, setRadioValue] = useState('first');
  const [switchOn, setSwitchOn] = useState(true);
  const [timezone, setTimezone] = useState('UTC');
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('ru');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <main className={styles.main}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Buttons</h2>
        <div className={styles.row}>
          <Button>Primary</Button>
          <Button variant="soft">Secondary</Button>
          <Button variant="outline">Tertiary</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className={styles.row}>
          <Button color="gray">Gray</Button>
          <Button color="danger">Danger</Button>
          <Button color="danger" variant="soft">
            Danger soft
          </Button>
          <Button color="success">Success</Button>
          <Button color="success" variant="outline">
            Success outline
          </Button>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Badges</h2>
        <div className={styles.row}>
          <Badge>Scheduled</Badge>
          <Badge color="success">Completed</Badge>
          <Badge color="danger">Cancelled</Badge>
          <Badge color="gray">Draft</Badge>
          <NotificationBadge count={5} />
          <NotificationBadge count={120} />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Text fields</h2>
        <div className={styles.column}>
          <TextField label="Patient name" placeholder="John Doe" hint="Full legal name" />
          <TextField label="Email" placeholder="patient@example.com" error="Invalid email format" />
          <TextField label="Disabled" placeholder="Read only" disabled />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Selection controls</h2>
        <div className={styles.row}>
          <Checkbox checked={checked} label="Send SMS reminder" onChange={setChecked} />
          <Checkbox checked indeterminate label="Partially selected" />
          <Checkbox checked={false} label="Disabled" disabled />
        </div>
        <div className={styles.row}>
          <RadioButton
            checked={radioValue === 'first'}
            name="visit"
            value="first"
            label="First visit"
            onChange={setRadioValue}
          />
          <RadioButton
            checked={radioValue === 'repeat'}
            name="visit"
            value="repeat"
            label="Repeat visit"
            onChange={setRadioValue}
          />
        </div>
        <div className={styles.row}>
          <SwitchToggle checked={switchOn} label="Active" onChange={setSwitchOn} />
          <SwitchToggle checked={false} label="Disabled" disabled />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Alerts</h2>
        <Alert title="Appointment confirmed">The patient will receive an email notification.</Alert>
        <Alert color="success" title="Treatment plan saved">
          All changes have been synced.
        </Alert>
        <Alert color="danger" title="Payment failed" onClose={() => {}}>
          The card was declined. Try another payment method.
        </Alert>
        <Alert color="gray">Clinic works until 20:00 today.</Alert>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Search selects</h2>
        <div className={styles.column}>
          <SearchSelect
            label="Часовой пояс"
            value={timezone}
            options={TIMEZONE_OPTIONS}
            onChange={setTimezone}
          />
          <SearchSelect
            label="Валюта"
            value={currency}
            options={CURRENCY_OPTIONS}
            onChange={setCurrency}
          />
          <SearchSelect
            label="Язык"
            value={language}
            options={LANGUAGE_OPTIONS}
            onChange={setLanguage}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Empty states</h2>
        <EmptyState
          title="No appointments yet"
          description="New appointments will appear here once scheduled."
          action={<Button variant="soft">Create appointment</Button>}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Modal</h2>
        <Button variant="soft" onClick={openModal}>
          Открыть модалку
        </Button>
      </section>

      {isModalOpen ? (
        <Modal
          title="Модалка со скроллом"
          closeLabel="Закрыть"
          scrollHintLabel="Прокрутите, чтобы увидеть остальное"
          onClose={closeModal}
          footer={
            <>
              <Button variant="soft" color="gray" onClick={closeModal}>
                Отмена
              </Button>
              <Button onClick={closeModal}>Сохранить</Button>
            </>
          }
        >
          {MODAL_DEMO_FIELDS.map((label) => (
            <TextField key={label} label={label} placeholder={label} />
          ))}
        </Modal>
      ) : null}
    </main>
  );
};

export default UiKitPage;
