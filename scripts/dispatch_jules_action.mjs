/**
 * scripts/dispatch_jules_action.mjs
 *
 * Dispatcher automatique de tâches vers l'agent Google Jules via GitHub Actions
 * ou en ligne de commande locale.
 *
 * Utilisation :
 *   node scripts/dispatch_jules_action.mjs --title "Mon titre" --prompt "Description"
 *   node scripts/dispatch_jules_action.mjs --from-task <task_id>
 */

import https from 'node:https';
import fs from 'node:fs';

// Lecture de la clé Jules depuis l'environnement ou les fichiers .env locaux
function getJulesApiKey() {
  if (process.env.JULES_API_KEY) return process.env.JULES_API_KEY;
  const envFiles = ['.env.local', '../heldonica-brain/.env'];
  for (const file of envFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      for (const line of content.split('\n')) {
        if (line.startsWith('JULES_API_KEY=')) {
          return line.split('=', 2)[1].trim().replace(/^["']|["']$/g, '');
        }
      }
    }
  }
  return null;
}

// Extraction des arguments CLI
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    title: process.env.TASK_TITLE || '',
    prompt: process.env.TASK_PROMPT || '',
    repo: process.env.TASK_REPO || 'farinhahelder-hue/heldonica',
    branch: process.env.TASK_BRANCH || 'main',
    taskId: process.env.TASK_ID || '',
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--title' && args[i + 1]) parsed.title = args[++i];
    else if (args[i] === '--prompt' && args[i + 1]) parsed.prompt = args[++i];
    else if (args[i] === '--repo' && args[i + 1]) parsed.repo = args[++i];
    else if (args[i] === '--branch' && args[i + 1]) parsed.branch = args[++i];
    else if (args[i] === '--from-task' && args[i + 1]) parsed.taskId = args[++i];
  }

  return parsed;
}

async function createJulesSession(apiKey, { title, prompt, repo, branch }) {
  const payload = JSON.stringify({
    title,
    prompt,
    sourceContext: {
      source: `sources/github/${repo}`,
      githubRepoContext: {
        startingBranch: branch,
      },
    },
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      'https://jules.googleapis.com/v1alpha/sessions',
      {
        method: 'POST',
        headers: {
          'X-Goog-Api-Key': apiKey,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch (err) {
              reject(new Error(`Réponse JSON invalide: ${err.message}`));
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  const apiKey = getJulesApiKey();
  if (!apiKey) {
    console.error('❌ Erreur : JULES_API_KEY introuvable dans l\'environnement ou .env.local');
    process.exit(1);
  }

  const { title, prompt, repo, branch, taskId } = parseArgs();

  if (!title || !prompt) {
    console.error('❌ Erreur : --title et --prompt sont requis pour créer une session Jules.');
    console.error('Usage : node scripts/dispatch_jules_action.mjs --title "Titre" --prompt "Prompt"');
    process.exit(1);
  }

  console.log(`🚀 Création de la session Google Jules sur ${repo} (branche ${branch})...`);
  console.log(`📌 Titre : ${title}`);

  try {
    const session = await createJulesSession(apiKey, { title, prompt, repo, branch });
    // L'identifiant vient de la reponse de l'API, et il repart dans
    // $GITHUB_OUTPUT puis dans un commentaire d'issue : on le restreint aux
    // caracteres qu'un identifiant peut avoir. Un retour a la ligne dedans
    // injecterait des sorties d'etape arbitraires.
    const sessionIdBrut = (session.name || '').split('/').pop() || session.id || 'inconnu';
    const sessionId =
      String(sessionIdBrut).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 128) || 'inconnu';
    const sessionUrl = `https://jules.google.com/session/${sessionId}`;

    console.log('\n✅ Session Jules créée avec succès !');
    console.log(`🔗 ID de session : ${sessionId}`);
    console.log(`🌐 Accès direct  : ${sessionUrl}\n`);

    // Sortie pour GitHub Actions (Step Summary & Output variables)
    if (process.env.GITHUB_STEP_SUMMARY) {
      const summaryMarkdown = `
### 🤖 Session Google Jules lancée

- **Titre** : ${title}
- **Dépôt** : \`${repo}\` (\`${branch}\`)
- **ID Session** : \`${sessionId}\`
- **Lien Direct** : [Ouvrir la session Jules](${sessionUrl})
${taskId ? `- **Tâche Registre** : \`${taskId}\`` : ''}
`;
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summaryMarkdown);
    }

    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `session_id=${sessionId}\n`);
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `session_url=${sessionUrl}\n`);
    }

    // Si lié à une tâche de la table agent_tasks, mise à jour optionnelle
    if (taskId && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        const { error: updateErr } = await supabase
          .from('agent_tasks')
          .update({
            status: 'in_progress',
            claimed_by: 'jules',
            claimed_at: new Date().toISOString(),
            notes: `Session Jules créée : ${sessionUrl}`,
          })
          .eq('id', taskId);
        if (updateErr) {
          console.error(`Erreur mise à jour tâche: ${updateErr.message}`);
        } else {
          console.log(`✓ Tâche ${taskId} mise à jour dans agent_tasks.`);
        }
      } catch (dbErr) {
        console.warn(`Avertissement mise à jour tâche: ${dbErr.message}`);
      }
    }
  } catch (err) {
    console.error(`❌ Échec de la création de la session Jules : ${err.message}`);
    process.exit(1);
  }
}

main();
