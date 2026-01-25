# BREZ Data Protection Protocol

## Auto-Backup System (Active)

**Location**: `~/BREZ_BACKUPS/`
**Schedule**: Every hour (skips if no changes detected)
**Retention**:
- Hourly: Last 24 backups
- Daily: Last 7 days

### How It Works
1. Runs every 60 minutes via launchd
2. Calculates hash of all .md and .json files
3. If hash matches last backup → skips (no wasted space)
4. If hash differs → full backup
5. Also creates one daily backup per day (kept for 7 days)

### Manual Backup Command
```bash
~/.claude/scripts/auto-backup.sh
```

### What Gets Backed Up
```
BREZ_BACKUPS/backup_[timestamp]/
├── claude_config/
│   ├── CLAUDE.md           ← Core Supermind brain
│   ├── rules/              ← All governance rules
│   ├── data/               ← Business data JSON
│   └── settings.json
├── app_source/
│   ├── lib/                ← All TypeScript source
│   └── components/guided/  ← Quest system UI
├── conversation_logs/      ← Last 5 session logs
└── MANIFEST.md             ← Backup metadata
```

### Latest Backup
```bash
ls -la ~/BREZ_BACKUPS/LATEST/
```

### Restore Command
```bash
cp -r ~/BREZ_BACKUPS/LATEST/claude_config/* ~/.claude/
```

---

## Critical Files (Never Lose These)

| File | Location | Purpose | Lines |
|------|----------|---------|-------|
| CLAUDE.md | ~/.claude/ | Supermind brain | ~1000 |
| source-of-truth.ts | brez-growth-generator/src/lib/data/ | All business data | 960 |
| supermind-core.json | ~/.claude/data/ | Machine-readable metrics | ~110 |
| governance.md | ~/.claude/rules/ | NO-gate + authority | ~305 |
| rituals.md | ~/.claude/rules/ | Weekly/monthly cadence | ~260 |

---

## Git Backup (App Code)

```bash
cd ~/brez-growth-generator
git add -A
git commit -m "Backup: $(date +%Y-%m-%d)"
git push origin main
```

---

## Cloud Backup (Future)

When app is deployed, add:
- [ ] Supabase backup to S3
- [ ] GitHub Actions for auto-deploy
- [ ] Vercel environment snapshots

---

## Recovery Scenarios

### Scenario 1: Lost CLAUDE.md
```bash
cp ~/BREZ_BACKUPS/LATEST/claude_config/CLAUDE.md ~/.claude/
```

### Scenario 2: Lost App Source
```bash
cp -r ~/BREZ_BACKUPS/LATEST/app_source/lib ~/brez-growth-generator/src/
```

### Scenario 3: Need Old Conversation
```bash
ls ~/BREZ_BACKUPS/LATEST/conversation_logs/
# Copy needed .jsonl file
```

### Scenario 4: Complete System Restore
```bash
# 1. Restore Claude config
cp -r ~/BREZ_BACKUPS/LATEST/claude_config/* ~/.claude/

# 2. Restore app source
cp -r ~/BREZ_BACKUPS/LATEST/app_source/lib ~/brez-growth-generator/src/

# 3. Verify
ls ~/.claude/CLAUDE.md
ls ~/brez-growth-generator/src/lib/data/source-of-truth.ts
```

---

## Session End Checklist

Before ending any major work session:

- [ ] Run `~/.claude/scripts/auto-backup.sh`
- [ ] Verify backup completed (check ~/BREZ_BACKUPS/LATEST/)
- [ ] Git commit if app code changed
- [ ] Note any unfinished work in CLAUDE.md or as TODO

---

## Offsite Backup (Recommended)

For additional protection:
```bash
# Sync to iCloud (if enabled)
cp -r ~/BREZ_BACKUPS ~/Library/Mobile\ Documents/com~apple~CloudDocs/

# Or sync to external drive
rsync -av ~/BREZ_BACKUPS /Volumes/ExternalDrive/
```

---

*Data is capital. Protect it like capital.*
