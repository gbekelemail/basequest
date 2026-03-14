const fetchLeaderboard = useCallback(async () => {
    try {
      const provider = getReadProvider();
      const core     = getCoreContract(provider);

      const totalRaw = await core.getTotalUsers();
      const total    = Number(totalRaw);
      setTotalUsers(total);

      if (total === 0) { setEntries([]); setLoading(false); return; }

      const count = Math.min(total, 50);

      // Fetch user addresses one by one using allUsers mapping
      const addrPromises = [];
      for (let i = 0; i < count; i++) {
        addrPromises.push(core.allUsers(i));
      }
      const addrs = await Promise.all(addrPromises);

      // Fetch XP and profiles for each address
      const [xpResults, profileResults] = await Promise.all([
        Promise.allSettled(addrs.map(addr => core.getUserXP(addr))),
        Promise.allSettled(addrs.map(addr => core.getUserProfile(addr))),
      ]);

      // Build entries
      const enriched = addrs.map((addr, i) => {
        const xp  = xpResults[i].status === "fulfilled" ? Number(xpResults[i].value) : 0;
        const lvl = getLevelInfo(xp);
        let tasksCompleted = 0, streakCount = 0, username = "";
        if (profileResults[i].status === "fulfilled") {
          tasksCompleted = Number(profileResults[i].value.tasksCompleted);
          streakCount    = Number(profileResults[i].value.streakCount);
          username       = profileResults[i].value.username || "";
        }
        return {
          address: addr,
          display: username || shortAddr(addr),
          xp,
          level:         lvl.current,
          tasksCompleted,
          streakCount,
          isCurrentUser: addr.toLowerCase() === currentAddress?.toLowerCase(),
        };
      });

      // Sort by XP descending and add rank
      const sorted = enriched
        .sort((a, b) => b.xp - a.xp)
        .map((e, i) => ({ ...e, rank: i + 1 }));

      setEntries(sorted);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
      setError(err.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, [currentAddress]);
