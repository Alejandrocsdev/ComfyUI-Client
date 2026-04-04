// Module CSS
import S from './style.module.css';
// Libraries
import { useState } from 'react';
// API
import { api, axiosPublic } from '../../api';

const defaultForm = {
  positive: '',
  negative: '',
  width: 512,
  height: 512,
  seed: 1,
  steps: 20,
  cfg: 8,
  sampler: 'euler',
  scheduler: 'normal',
  denoise: 1,
  output: '',
};

const Home = () => {
  const [form, setForm] = useState(defaultForm);
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setImage('');

    const body = {
      prompt: {
        positive: form.positive,
        negative: form.negative,
      },
      resolution: {
        width: String(form.width),
        height: String(form.height),
      },
      sampler: {
        seed: String(form.seed),
        steps: String(form.steps),
        cfg: String(form.cfg),
        denoise: String(form.denoise),
        name: form.sampler,
        scheduler: form.scheduler,
      },
      output: form.output,
    };

    // =========================
    // 1. SEND PROMPT
    // =========================
    let promptId = null;

    await api(axiosPublic.post('/api/comfyui/prompt', body), {
      onSuccess: (data) => {
        promptId = data?.prompt_id;
      },
      onError: () => {
        setLoading(false);
      },
    });

    if (!promptId) {
      console.error('No prompt_id');
      setLoading(false);
      return;
    }

    console.log('promptId:', promptId);

    // =========================
    // 2. POLLING
    // =========================
    const maxAttempts = 30;
    const delay = 2000;

    for (let i = 0; i < maxAttempts; i++) {
      let imageResult = null;
      let notFound = false;

      await api(axiosPublic.get(`/api/comfyui/image/${promptId}`), {
        onSuccess: (data) => {
          imageResult = data?.image;
        },
        onError: (error) => {
          if (error.response?.status === 404) {
            notFound = true;
            console.log(`Attempt ${i + 1}: not ready`);
          } else {
            console.error('Polling error:', error);
          }
        },
      });

      // ✅ if got image
      if (imageResult) {
        setImage(imageResult);
        setLoading(false);
        console.log('✅ Image ready:', imageResult);
        return;
      }

      // ❌ if real error → stop
      if (!notFound) {
        setLoading(false);
        return;
      }

      // wait 2 sec
      await new Promise((r) => setTimeout(r, delay));
    }

    console.warn('⏰ Timeout after 1 minute');
    setLoading(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setForm(defaultForm);
    setImage('');
  };

  return (
    <div className={S.container}>
      <div className={S.panel}>
        <h2>Generate Image</h2>

        <label>Positive Prompt</label>
        <textarea
          name="positive"
          value={form.positive}
          onChange={handleChange}
        />

        <label>Negative Prompt</label>
        <textarea
          name="negative"
          value={form.negative}
          onChange={handleChange}
        />

        <div className={S.row}>
          <div className={S.field}>
            <label>Width</label>
            <input
              name="width"
              type="number"
              value={form.width}
              onChange={handleChange}
            />
          </div>

          <div className={S.field}>
            <label>Height</label>
            <input
              name="height"
              type="number"
              value={form.height}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={S.row}>
          <div className={S.field}>
            <label>Seed</label>
            <input name="seed" value={form.seed} onChange={handleChange} />
          </div>

          <div className={S.field}>
            <label>Steps</label>
            <input
              name="steps"
              type="number"
              value={form.steps}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={S.row}>
          <div className={S.field}>
            <label>CFG</label>
            <input
              name="cfg"
              type="number"
              step="0.5"
              value={form.cfg}
              onChange={handleChange}
            />
          </div>

          <div className={S.field}>
            <label>Denoise</label>
            <input
              name="denoise"
              type="number"
              step="0.1"
              value={form.denoise}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={S.row}>
          <div className={S.field}>
            <label>Sampler</label>
            <select name="sampler" value={form.sampler} onChange={handleChange}>
              <option value="euler">Euler</option>
              <option value="dpmpp">DPM++</option>
              <option value="ddim">DDIM</option>
            </select>
          </div>

          <div className={S.field}>
            <label>Scheduler</label>
            <select
              name="scheduler"
              value={form.scheduler}
              onChange={handleChange}
            >
              <option value="normal">Normal</option>
              <option value="karras">Karras</option>
            </select>
          </div>
        </div>

        <label>Output</label>
        <input name="output" value={form.output} onChange={handleChange} />

        <div className={S.buttonRow}>
          <button
            className={S.generateBtn}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>

          <button className={S.resetBtn} onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      <div className={S.output}>
        {image ? (
          <img src={image} alt="result" />
        ) : (
          <div className={S.placeholder}>Image will appear here</div>
        )}
      </div>
    </div>
  );
};

export default Home;
