const { fmtDate, fmtDateTime } = require("../utils/format");

const WEEKDAYS = [
  { stem: "niedziel", dow: 0 },
  { stem: "poniedzia", dow: 1 },
  { stem: "wtor", dow: 2 },
  { stem: "środ", dow: 3 },
  { stem: "czwart", dow: 4 },
  { stem: "piąt", dow: 5 },
  { stem: "sobo", dow: 6 },
];

const MONTHS = [
  { stem: "styczni", label: "styczniu" },
  { stem: "lut", label: "lutym" },
  { stem: "marc", label: "marcu" },
  { stem: "kwietni", label: "kwietniu" },
  { stem: "maj", label: "maju" },
  { stem: "czerwc", label: "czerwcu" },
  { stem: "lipc", label: "lipcu" },
  { stem: "sierpni", label: "sierpniu" },
  { stem: "wrześni", label: "wrześniu" },
  { stem: "październik", label: "październiku" },
  { stem: "listopad", label: "listopadzie" },
  { stem: "grudni", label: "grudniu" },
];

// Finds a project whose name is literally mentioned in the user's message.
function findMentionedProject(message, projects) {
  const q = message.toLowerCase();
  return projects.find((p) => q.includes(p.name.toLowerCase())) || null;
}

// Same idea, but returns every project named in the message — used to compare two projects.
function findMentionedProjects(message, projects) {
  const q = message.toLowerCase();
  return projects.filter((p) => q.includes(p.name.toLowerCase()));
}

// Nearest date (today or later) that falls on the given day of week.
function nextWeekdayDate(targetDow) {
  const d = new Date();
  const diff = (targetDow - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function answerQuery(message, data, matchProject) {
  const q = message.toLowerCase();
  const { projects, tasks, commits, folders } = data;
  const matchProj = matchProject;
  const scopeTasks = matchProj
    ? tasks.filter((t) => t.projectId === matchProj.id)
    : tasks;

  const taskHit = tasks.find(
    (t) => t.title.length > 3 && q.includes(t.title.toLowerCase()),
  );

  if (taskHit && q.includes("za ile dni")) {
    if (!taskHit.due) return `Zadanie "${taskHit.title}" nie ma ustawionego terminu.`;
    const diffDays = Math.ceil(
      (new Date(taskHit.due) - new Date(new Date().toDateString())) / 86400000,
    );
    if (diffDays < 0) return `Termin zadania "${taskHit.title}" minął ${Math.abs(diffDays)} dni temu (${fmtDate(taskHit.due)}).`;
    if (diffDays === 0) return `Zadanie "${taskHit.title}" ma termin dzisiaj!`;
    return `Do terminu zadania "${taskHit.title}" zostało ${diffDays} dni (${fmtDate(taskHit.due)}).`;
  }

  if (
    taskHit &&
    (q.includes("zadani") || q.includes("status") || q.includes("szczegó"))
  ) {
    const proj = taskHit.projectId
      ? projects.find((p) => p.id === taskHit.projectId)
      : null;
    return (
      `${taskHit.title}\n` +
      `Typ: ${taskHit.type}\n` +
      `Priorytet: ${taskHit.priority}\n` +
      `Status: ${taskHit.done ? "ukończone" : "w toku"}\n` +
      (taskHit.due ? `Termin: ${fmtDate(taskHit.due)}\n` : "") +
      (proj ? `Projekt: ${proj.name}` : "Zadanie globalne")
    );
  }

  if (q.includes("procent")) {
    if (matchProj) {
      const pt = tasks.filter((t) => t.projectId === matchProj.id);
      if (!pt.length) return `Projekt "${matchProj.name}" nie ma jeszcze żadnych zadań.`;
      const pct = Math.round((pt.filter((t) => t.done).length / pt.length) * 100);
      return `Projekt "${matchProj.name}" jest ukończony w ${pct}%.`;
    }
    if (!tasks.length) return "Nie masz jeszcze żadnych zadań.";
    const pct = Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100);
    return `Wszystkie Twoje zadania są ukończone w ${pct}%.`;
  }

  if (q.includes("ile") && q.includes("projekt")) {
    return `Masz aktualnie ${projects.length} projekt${projects.length === 1 ? "" : "y/ów"} w Synapse.`;
  }

  if (q.includes("puste") || q.includes("zaniedban")) {
    const empty = projects.filter((p) => !tasks.some((t) => t.projectId === p.id));
    if (!empty.length) return "Każdy projekt ma już co najmniej jedno zadanie.";
    return "Projekty bez żadnych zadań:\n" + empty.map((p) => `• ${p.name}`).join("\n");
  }

  if (
    q.includes("projekt") &&
    (q.includes("lista") || q.includes("jakie") || q.includes("pokaż") || q.includes("wszystk"))
  ) {
    if (!projects.length) return "Nie masz jeszcze żadnych projektów.";
    return (
      "Twoje projekty:\n" +
      projects.map((p) => `• ${p.name} — ${p.domain || "brak domeny"}`).join("\n")
    );
  }

  const comparedProjects = findMentionedProjects(message, projects);
  if (q.includes("porównaj") || (q.includes("który") && q.includes("więcej") && comparedProjects.length >= 2)) {
    if (comparedProjects.length < 2) return "Podaj nazwy dwóch projektów, które mam porównać.";
    const [a, b] = comparedProjects;
    const na = tasks.filter((t) => t.projectId === a.id).length;
    const nb = tasks.filter((t) => t.projectId === b.id).length;
    if (na === nb) return `${a.name} i ${b.name} mają tyle samo zadań (${na}).`;
    const winner = na > nb ? a : b;
    return `${winner.name} ma więcej zadań (${Math.max(na, nb)} vs ${Math.min(na, nb)}).`;
  }

  if (q.includes("najwięcej") && q.includes("zada")) {
    const counts = projects
      .map((p) => ({ p, n: tasks.filter((t) => t.projectId === p.id && !t.done).length }))
      .sort((a, b) => b.n - a.n);
    if (!counts[0] || counts[0].n === 0) return "Żaden projekt nie ma obecnie otwartych zadań.";
    return `Najwięcej otwartych zadań ma "${counts[0].p.name}" — ${counts[0].n}.`;
  }

  if (q.includes("najwięcej") && q.includes("commit")) {
    const counts = projects
      .map((p) => ({ p, n: commits.filter((c) => c.projectId === p.id).length }))
      .sort((a, b) => b.n - a.n);
    if (!counts[0] || counts[0].n === 0) return "Żaden projekt nie ma jeszcze zapisanych commitów.";
    return `Najwięcej commitów ma "${counts[0].p.name}" — ${counts[0].n}.`;
  }

  if (q.includes("kolor")) {
    if (matchProj) {
      if (!matchProj.colors.length) return `Projekt "${matchProj.name}" nie ma jeszcze zdefiniowanych kolorów.`;
      return `Kolory projektu ${matchProj.name}: ${matchProj.colors.join(", ")}`;
    }
    const withColors = projects.filter((p) => p.colors.length);
    if (!withColors.length) return "Nie masz jeszcze zdefiniowanych kolorów w żadnym projekcie.";
    return withColors.map((p) => `${p.name}: ${p.colors.join(", ")}`).join("\n");
  }

  if (q.includes("czcionk") || q.includes("font")) {
    if (matchProj) {
      if (!matchProj.fonts.length) return `Projekt "${matchProj.name}" nie ma zdefiniowanych czcionek.`;
      return `Czcionki projektu ${matchProj.name}: ${matchProj.fonts.map((f) => f.name).join(", ")}`;
    }
    const allFonts = [...new Set(projects.flatMap((p) => p.fonts.map((f) => f.name)))];
    if (!allFonts.length) return "Nie masz jeszcze zdefiniowanych czcionek.";
    return `Czcionki we wszystkich projektach: ${allFonts.join(", ")}`;
  }

  if (q.includes("stack") || q.includes("technologi")) {
    if (matchProj) {
      if (!matchProj.techs.length) return `Projekt "${matchProj.name}" nie ma jeszcze stacku technologicznego.`;
      return `Stack projektu ${matchProj.name}: ${matchProj.techs.join(", ")}`;
    }
    const withTechs = projects.filter((p) => p.techs.length);
    if (!withTechs.length) return "Nie masz jeszcze zdefiniowanych technologii w żadnym projekcie.";
    return withTechs.map((p) => `${p.name}: ${p.techs.join(", ")}`).join("\n");
  }

  if ((q.includes("opowiedz") || q.includes("co to jest")) && matchProj) {
    const pt = tasks.filter((t) => t.projectId === matchProj.id);
    const pc = commits.filter((c) => c.projectId === matchProj.id);
    return (
      `${matchProj.name}\n` +
      `Typ: ${matchProj.type}\n` +
      (matchProj.domain ? `Domena: ${matchProj.domain}\n` : "") +
      (matchProj.desc ? `Opis: ${matchProj.desc}\n` : "") +
      `Utworzony: ${fmtDate(matchProj.createdAt)}\n` +
      `Zadania: ${pt.length} (ukończone: ${pt.filter((t) => t.done).length})\n` +
      `Commity: ${pc.length}`
    );
  }

  if (q.includes("repo") || q.includes("link")) {
    if (matchProj) {
      return matchProj.repo
        ? `Repozytorium ${matchProj.name}: ${matchProj.repo}`
        : `Projekt "${matchProj.name}" nie ma ustawionego linku do repo.`;
    }
    const withRepo = projects.filter((p) => p.repo);
    if (!withRepo.length) return "Żaden projekt nie ma jeszcze ustawionego linku do repo.";
    return withRepo.map((p) => `${p.name}: ${p.repo}`).join("\n");
  }

  if (q.includes("powstał") || (q.includes("data") && q.includes("utworz"))) {
    if (!matchProj) return "Podaj nazwę projektu, o którego datę powstania pytasz.";
    return `Projekt "${matchProj.name}" powstał: ${fmtDate(matchProj.createdAt)}`;
  }

  if (q.includes("ustawien")) {
    if (!matchProj) return 'Podaj nazwę projektu, o którego ustawienia pytasz, np. "ustawienia Portfolio Website".';
    return (
      `Ustawienia ${matchProj.name}:\n` +
      `Typ: ${matchProj.type}\n` +
      `Domena: ${matchProj.domain || "brak"}\n` +
      `Repo: ${matchProj.repo || "brak"}\n` +
      `Kolory: ${matchProj.colors.join(", ") || "brak"}\n` +
      `Czcionki: ${matchProj.fonts.map((f) => f.name).join(", ") || "brak"}\n` +
      `Technologie: ${matchProj.techs.join(", ") || "brak"}`
    );
  }

  if (q.includes("priorytet") || q.includes("najważniejsz") || q.includes("pilne")) {
    let level = "high";
    let levelLabel = "wysokiego";
    if (q.includes("nisk")) {
      level = "low";
      levelLabel = "niskiego";
    } else if (q.includes("średni") || q.includes("sredni")) {
      level = "medium";
      levelLabel = "średniego";
    }
    const filtered = scopeTasks.filter((t) => !t.done && t.priority === level);
    if (!filtered.length) return matchProj ? `Brak zadań ${levelLabel} priorytetu w "${matchProj.name}".` : `Brak zadań ${levelLabel} priorytetu.`;
    return `Zadania ${levelLabel} priorytetu${matchProj ? ` w "${matchProj.name}"` : ""}:\n` +
      filtered.map((t) => `• ${t.title}${t.due ? ` (${fmtDate(t.due)})` : ""}`).join("\n");
  }

  if (q.includes("najstarsze") || q.includes("najdłużej")) {
    const openSorted = scopeTasks
      .filter((t) => !t.done)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (!openSorted.length) return matchProj ? `Brak otwartych zadań w "${matchProj.name}".` : "Nie masz żadnych otwartych zadań.";
    const oldest = openSorted[0];
    const days = Math.floor((Date.now() - new Date(oldest.createdAt)) / 86400000);
    return `Najdłużej czeka "${oldest.title}" — otwarte od ${days} dni (${fmtDate(oldest.createdAt)}).`;
  }

  if (q.includes("ostatni") && (q.includes("dodał") || q.includes("dodan"))) {
    const sorted = [...scopeTasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (!sorted.length) return matchProj ? `Brak zadań w "${matchProj.name}".` : "Nie masz jeszcze żadnych zadań.";
    const t = sorted[0];
    const proj = t.projectId ? projects.find((p) => p.id === t.projectId) : null;
    return (
      `Ostatnio dodane zadanie${matchProj ? ` w "${matchProj.name}"` : ""}: "${t.title}"\n` +
      `Dodane: ${fmtDateTime(t.createdAt)}` +
      (!matchProj && proj ? `\nProjekt: ${proj.name}` : "")
    );
  }

  if (q.includes("bez terminu")) {
    const noDue = scopeTasks.filter((t) => !t.done && !t.due);
    if (!noDue.length) return matchProj ? `Wszystkie otwarte zadania w "${matchProj.name}" mają ustawiony termin.` : "Wszystkie Twoje otwarte zadania mają ustawiony termin.";
    return `Zadania bez terminu${matchProj ? ` w "${matchProj.name}"` : ""}:\n` + noDue.map((t) => `• ${t.title}`).join("\n");
  }

  if (q.includes("jutro")) {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const dueTomorrow = scopeTasks.filter((t) => !t.done && t.due === tomorrow);
    if (!dueTomorrow.length) return matchProj ? `Brak zadań na jutro w "${matchProj.name}".` : "Nie masz żadnych terminów jutro.";
    return `Zadania na jutro${matchProj ? ` w "${matchProj.name}"` : ""}:\n` +
      dueTomorrow.map((t) => `• [${t.type.toUpperCase()}] ${t.title}`).join("\n");
  }

  if (q.includes("wczoraj")) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const dueYesterday = scopeTasks.filter((t) => t.due === yesterday);
    if (!dueYesterday.length) return matchProj ? `Brak zadań z terminem wczoraj w "${matchProj.name}".` : "Nie miałeś żadnych zadań z terminem wczoraj.";
    return `Zadania z terminem wczoraj${matchProj ? ` w "${matchProj.name}"` : ""}:\n` +
      dueYesterday.map((t) => `• ${t.title}${t.done ? " (ukończone)" : " (otwarte)"}`).join("\n");
  }

  const weekdayMatch = WEEKDAYS.find((w) => q.includes(w.stem));
  if (weekdayMatch) {
    const dateStr = nextWeekdayDate(weekdayMatch.dow);
    const dueThatDay = scopeTasks.filter((t) => !t.done && t.due === dateStr);
    if (!dueThatDay.length) return `Brak zadań na ${fmtDate(dateStr)}${matchProj ? ` w "${matchProj.name}"` : ""}.`;
    return `Zadania na ${fmtDate(dateStr)}${matchProj ? ` w "${matchProj.name}"` : ""}:\n` +
      dueThatDay.map((t) => `• ${t.title}`).join("\n");
  }

  if ((q.includes("najbliższy") || q.includes("najbliższe")) && (q.includes("termin") || q.includes("deadline"))) {
    const upcoming = scopeTasks
      .filter((t) => !t.done && t.due)
      .sort((a, b) => new Date(a.due) - new Date(b.due));
    if (!upcoming.length) return matchProj ? `Brak nadchodzących terminów w "${matchProj.name}".` : "Nie masz żadnych nadchodzących terminów.";
    const next = upcoming[0];
    return `Najbliższy termin${matchProj ? ` w "${matchProj.name}"` : ""}: "${next.title}" — ${fmtDate(next.due)}.`;
  }

  if (q.includes("dzisiaj") || q.includes("dziś")) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const dueToday = scopeTasks.filter((t) => !t.done && t.due === todayStr);
    if (!dueToday.length) return "Nie masz dziś żadnych terminów zadań.";
    return "Zadania na dziś:\n" + dueToday.map((t) => `• [${t.type.toUpperCase()}] ${t.title}`).join("\n");
  }

  if ((q.includes("ukończ") || q.includes("zrobił") || q.includes("skończ")) && q.includes("tygodni")) {
    const cutoff = Date.now() - 7 * 86400000;
    const doneThisWeek = (matchProj ? tasks.filter((t) => t.projectId === matchProj.id) : tasks)
      .filter((t) => t.done && t.doneAt && new Date(t.doneAt).getTime() >= cutoff);
    if (!doneThisWeek.length) return matchProj ? `Nie ukończyłeś żadnych zadań w "${matchProj.name}" w tym tygodniu.` : "Nie ukończyłeś żadnych zadań w tym tygodniu.";
    return `Ukończone w tym tygodniu${matchProj ? ` w "${matchProj.name}"` : ""} (${doneThisWeek.length}):\n` +
      doneThisWeek.map((t) => `• ${t.title}`).join("\n");
  }

  if (q.includes("tygodni")) {
    const now = new Date();
    const in7 = new Date(Date.now() + 7 * 86400000);
    const dueSoon = scopeTasks
      .filter((t) => !t.done && t.due && new Date(t.due) >= now && new Date(t.due) <= in7)
      .sort((a, b) => new Date(a.due) - new Date(b.due));
    if (!dueSoon.length) return "Nie masz zadań z terminem w najbliższym tygodniu.";
    return "Zadania na najbliższy tydzień:\n" + dueSoon.map((t) => `• ${t.title} — ${fmtDate(t.due)}`).join("\n");
  }

  if (q.includes("tempo")) {
    const cutoff = Date.now() - 14 * 86400000;
    const recentDone = (matchProj ? tasks.filter((t) => t.projectId === matchProj.id) : tasks)
      .filter((t) => t.done && t.doneAt && new Date(t.doneAt).getTime() >= cutoff);
    const perDay = (recentDone.length / 14).toFixed(1);
    return (
      `W ostatnich 14 dniach ukończyłeś ${recentDone.length} zadań${matchProj ? ` w "${matchProj.name}"` : ""} ` +
      `— średnio ${perDay} dziennie.`
    );
  }

  const monthMatch = MONTHS.find((m) => q.includes(m.stem));
  if (monthMatch) {
    const year = new Date().getFullYear();
    const inMonth = (isoStr) => {
      if (!isoStr) return false;
      const d = new Date(isoStr);
      return d.getFullYear() === year && d.getMonth() === MONTHS.indexOf(monthMatch);
    };
    const doneThatMonth = (matchProj ? tasks.filter((t) => t.projectId === matchProj.id) : tasks)
      .filter((t) => t.done && inMonth(t.doneAt));
    const commitsThatMonth = (matchProj ? commits.filter((c) => c.projectId === matchProj.id) : commits)
      .filter((c) => inMonth(c.createdAt));
    if (!doneThatMonth.length && !commitsThatMonth.length) {
      return `Nie znalazłem żadnej aktywności w ${monthMatch.label}${matchProj ? ` w projekcie "${matchProj.name}"` : ""}.`;
    }
    return (
      `Aktywność w ${monthMatch.label}${matchProj ? ` w "${matchProj.name}"` : ""}:\n` +
      `Ukończone zadania: ${doneThatMonth.length}\n` +
      `Commity: ${commitsThatMonth.length}`
    );
  }

  if (q.includes("zadani") || q.includes("todo") || q.includes("do zrobienia")) {
    const todo = scopeTasks.filter((t) => !t.done);
    if (!todo.length) return matchProj ? `Brak otwartych zadań w projekcie "${matchProj.name}".` : "Nie masz żadnych otwartych zadań!";
    return (
      `Otwarte zadania${matchProj ? ` w "${matchProj.name}"` : ""}:\n` +
      todo.slice(0, 8).map((t) => `• [${t.type.toUpperCase()}] ${t.title}${t.due ? ` (${fmtDate(t.due)})` : ""}`).join("\n")
    );
  }

  if (q.includes("przeterminowan") || q.includes("spóźnion") || q.includes("deadline")) {
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    const overdue = scopeTasks.filter((t) => !t.done && t.due && new Date(t.due) < cutoff);
    if (!overdue.length) return matchProj ? `Brak przeterminowanych zadań w "${matchProj.name}".` : "Nie masz żadnych przeterminowanych zadań!";
    return `Przeterminowane zadania (${overdue.length}):\n` + overdue.map((t) => `• ${t.title} — ${fmtDate(t.due)}`).join("\n");
  }

  if (q.includes("statystyk") || q.includes("podsumow")) {
    if (matchProj) {
      const pt = tasks.filter((t) => t.projectId === matchProj.id);
      const done = pt.filter((t) => t.done).length;
      return `Podsumowanie ${matchProj.name}:\nZadania: ${pt.length}\nUkończone: ${done}\nDo zrobienia: ${pt.length - done}`;
    }
    const done = tasks.filter((t) => t.done).length;
    return `Podsumowanie Synapse:\nProjekty: ${projects.length}\nZadania: ${tasks.length}\nUkończone: ${done}\nDo zrobienia: ${tasks.length - done}\nCommity: ${commits.length}`;
  }

  if (q.includes("typ") && q.includes("zada")) {
    if (!scopeTasks.length) return matchProj ? `Projekt "${matchProj.name}" nie ma jeszcze zadań.` : "Nie masz jeszcze żadnych zadań.";
    const byType = {};
    scopeTasks.forEach((t) => {
      byType[t.type] = (byType[t.type] || 0) + 1;
    });
    return (
      `Rozkład zadań wg typu${matchProj ? ` w "${matchProj.name}"` : ""}:\n` +
      Object.entries(byType).map(([type, n]) => `• ${type}: ${n}`).join("\n")
    );
  }

  if (q.includes("stosunek") || (q.includes("commit") && q.includes("typ"))) {
    const scoped = matchProj ? commits.filter((c) => c.projectId === matchProj.id) : commits;
    if (!scoped.length) return matchProj ? `Brak commitów w "${matchProj.name}".` : "Brak zapisanych commitów.";
    const byType = {};
    scoped.forEach((c) => {
      byType[c.type] = (byType[c.type] || 0) + 1;
    });
    return (
      `Rozkład commitów wg typu${matchProj ? ` w "${matchProj.name}"` : ""}:\n` +
      Object.entries(byType).map(([type, n]) => `• ${type}: ${n}`).join("\n")
    );
  }

  if (q.includes("domen")) {
    if (matchProj) return `Domena projektu ${matchProj.name}: ${matchProj.domain || "nie ustawiona"}`;
    const withDomains = projects.filter((p) => p.domain);
    return withDomains.map((p) => `${p.name}: ${p.domain}`).join("\n") || "Brak ustawionych domen.";
  }

  if (q.includes("commit")) {
    const scoped = matchProj ? commits.filter((c) => c.projectId === matchProj.id) : commits;
    if (!scoped.length) return matchProj ? `Brak commitów w "${matchProj.name}".` : "Brak zapisanych commitów.";
    return `Ostatnie commity${matchProj ? ` w "${matchProj.name}"` : ""}:\n` +
      scoped.slice(0, 5).map((c) => `• ${c.hash} ${c.message}`).join("\n");
  }

  if (q.includes("notat")) {
    if (!matchProj) return "Podaj nazwę projektu, o którego notatki pytasz.";
    return matchProj.notes ? `Notatki ${matchProj.name}:\n${matchProj.notes}` : `Projekt "${matchProj.name}" nie ma jeszcze notatek.`;
  }

  if (q.includes("katalog") || q.includes("folder")) {
    if (!folders.length) return "Nie masz jeszcze żadnych katalogów.";
    return folders
      .map((f) => `• ${f.name} — ${projects.filter((p) => p.folderId === f.id).length} projektów`)
      .join("\n");
  }

  if (q.includes("cześć") || q.includes("hej") || q.includes("siema") || q.includes("hello")) {
    return "Cześć! Jak mogę Ci dzisiaj pomóc? Zapytaj o projekty, zadania, kolory, czcionki lub statystyki.";
  }

  if (q.includes("pomoc") || q.includes("co umiesz")) {
    return (
      "Mogę odpowiedzieć na pytania o kolory, czcionki i stack projektów, zadania (otwarte, " +
      "przeterminowane, priorytetowe, wg typu), terminy (dziś, jutro, wczoraj, konkretny dzień " +
      "tygodnia, najbliższy deadline), commity, notatki, katalogi oraz statystyki i rankingi " +
      "projektów. Mogę też dodawać zadania — napisz np. \"dodaj zadanie: popraw stopkę priorytet " +
      "wysoki termin jutro\"."
    );
  }

  return 'Nie jestem pewien, o co pytasz. Spróbuj np. "jakie mam zadania?", "pokaż kolory w [projekt]" albo "dodaj zadanie: ...".';
}

module.exports = { answerQuery, findMentionedProject };
