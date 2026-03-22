import re
import os

filepath = r"c:\Users\S.B.Reddy\Desktop\msgreplier-main\msgreplier-main\src\app\love-space\components\snake-ladder.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. INITIAL_STATE
code = re.sub(
    r"const INITIAL_STATE: SnakeLadderState = \{[\s\S]*?\};",
    """const INITIAL_STATE: SnakeLadderState = {
    players: {},
    currentTurn: null,
    diceValue: null,
    winner: null,
    version: 0,
    updatedAt: Date.now()
};""",
    code
)

# 2. Add isSynced state
code = re.sub(
    r"const \[loading, setLoading\] = useState\(true\);",
    "const [loading, setLoading] = useState(true);\n    const [isSynced, setIsSynced] = useState(false);",
    code
)

# 3. useEffect for isAnimatingRef
code = re.sub(
    r"    useEffect\(\(\) => \{\n        isAnimatingRef\.current = isAnimating;\n        if \(!isAnimating\) \{\n            setVisualP1\(state\.player1Position\);\n            setVisualP2\(state\.player2Position\);\n        \}\n    \}, \[state\.player1Position, state\.player2Position, isAnimating\]\);",
    """    useEffect(() => {
        isAnimatingRef.current = isAnimating;
        if (!isAnimating) {
            const p1Pos = (members[0] && state.players && state.players[members[0].id]) ? state.players[members[0].id].position : 1;
            const p2Pos = (members[1] && state.players && state.players[members[1].id]) ? state.players[members[1].id].position : 1;
            setVisualP1(p1Pos);
            setVisualP2(p2Pos);
        }
    }, [state.players, members, isAnimating]);""",
    code
)

# 4. Set initial turn
code = re.sub(
    r"    // Set initial turn when members load\s+useEffect\(\(\) => \{\s+if \(members\.length > 0\) \{\s+setState\(s => \(s\.currentTurn \? s : \{ \.\.\.s, currentTurn: members\[0\]\.id \}\)\);\s+\}\s+\}, \[members\]\);",
    """    // Set initial turn and players when members load
    useEffect(() => {
        if (members.length > 0) {
            setState(s => {
                const newPlayers = { ...(s.players || {}) };
                let changed = false;
                members.forEach(m => {
                    if (!newPlayers[m.id]) {
                        newPlayers[m.id] = { position: 1 };
                        changed = true;
                    }
                });
                if (!s.currentTurn || changed) {
                    return { ...s, currentTurn: s.currentTurn || members[0].id, players: newPlayers };
                }
                return s;
            });
        }
    }, [members]);""",
    code
)

# 5. rollDice initial pos
code = re.sub(
    r"let newPos = myPlayerNum === 1 \? state\.player1Position : state\.player2Position;",
    "let newPos = (state.players && state.players[currentMember.id]) ? state.players[currentMember.id].position : 1;",
    code
)

# 6. rollDice state update
code = re.sub(
    r"                \.\.\.state,\n                player1Position: myPlayerNum === 1 \? newPos : state\.player1Position,\n                player2Position: myPlayerNum === 2 \? newPos : state\.player2Position,\n                currentTurn: winner \? null : \(roll === 6 \? currentMember\.id : nextTurn\), // Roll 6 = extra turn\n                winner,\n                lastActionMessage: actionMessage \|\| \(roll === 6 \? `\$\{currentMember\.nickname\} rolled a 6 and gets another turn!` : undefined\),\n                lastPath: path,\n                lastPathPlayer: myPlayerNum,\n                lastRollValue: roll",
    """                ...state,
                players: {
                    ...(state.players || {}),
                    [currentMember.id]: { position: newPos }
                },
                currentTurn: winner ? null : (roll === 6 ? currentMember.id : nextTurn), // Roll 6 = extra turn
                winner,
                lastActionMessage: actionMessage || (roll === 6 ? `${currentMember.nickname} rolled a 6 and gets another turn!` : undefined),
                lastPath: path,
                lastPathPlayer: currentMember.id,
                diceValue: roll""",
    code
)

# 7. ApplyRemoteState diceValue
code = re.sub(
    r"        if \(remoteState\.lastRollValue !== undefined\) \{\n            setLastRoll\(remoteState\.lastRollValue\);\n        \}",
    """        if (remoteState.diceValue !== undefined) {
            setLastRoll(remoteState.diceValue);
        }""",
    code
)

# 8. ApplyRemoteState p1To/p2To
code = re.sub(
    r"        const p1From = visualP1Ref\.current;\n        const p2From = visualP2Ref\.current;\n        const p1To = remoteState\.player1Position;\n        const p2To = remoteState\.player2Position;",
    """        const p1From = visualP1Ref.current;
        const p2From = visualP2Ref.current;
        const p1To = (members[0] && remoteState.players && remoteState.players[members[0].id]) ? remoteState.players[members[0].id].position : 1;
        const p2To = (members[1] && remoteState.players && remoteState.players[members[1].id]) ? remoteState.players[members[1].id].position : 1;""",
    code
)

# 9. ApplyRemoteState path1
code = re.sub(
    r"        if \(p1From !== p1To && p2From === p2To\) \{\n            const path = \(remoteState\.lastPathPlayer === 1 && remoteState\.lastPath\?\.length\) \? remoteState\.lastPath : buildPath\(p1From, p1To\);",
    """        if (p1From !== p1To && p2From === p2To) {
            const path = (remoteState.lastPathPlayer === (members[0]?.id) && remoteState.lastPath?.length) ? remoteState.lastPath : buildPath(p1From, p1To);""",
    code
)

# 10. ApplyRemoteState path2
code = re.sub(
    r"        \} else if \(p1From === p1To && p2From !== p2To\) \{\n            const path = \(remoteState\.lastPathPlayer === 2 && remoteState\.lastPath\?\.length\) \? remoteState\.lastPath : buildPath\(p2From, p2To\);",
    """        } else if (p1From === p1To && p2From !== p2To) {
            const path = (remoteState.lastPathPlayer === (members[1]?.id) && remoteState.lastPath?.length) ? remoteState.lastPath : buildPath(p2From, p2To);""",
    code
)

# 11. init loading guard
code = re.sub(
    r"            \} finally \{\n                setLoading\(false\);\n                requestSync\('init'\);\n            \}",
    """            } finally {
                setLoading(false);
                if (members.length > 0 && members[0].id === currentMember.id) {
                    setIsSynced(true);
                }
                requestSync('init');
            }""",
    code
)

# 12. handleSyncState
code = re.sub(
    r"        const handleSyncState = \(payload: any\) => \{\n            if \(\!payload \|\| payload\.game !== 'snake'\) return;\n            applyRemoteState\(payload\.state as SnakeLadderState, parseUpdatedAt\(payload\.updatedAt\), true\);\n        \};",
    """        const handleSyncState = (payload: any) => {
            if (!payload || payload.game !== 'snake') return;
            applyRemoteState(payload.state as SnakeLadderState, parseUpdatedAt(payload.updatedAt), true);
            setIsSynced(true);
        };""",
    code
)

# 13. handleGameMove
code = re.sub(
    r"        const handleGameMove = \(payload: any\) => \{\n            if \(\!payload \|\| payload\.game !== 'snake'\) return;",
    """        const handleGameMove = (payload: any) => {
            if (!payload || payload.game !== 'snake') return;
            if (!isSynced) setIsSynced(true);""",
    code
)

# 14. handleDiceResolved
code = re.sub(
    r"        const handleDiceResolved = \(payload: any\) => \{\n            if \(\!payload \|\| payload\.playerNum !== undefined && payload\.playerNum === myPlayerNum\) return;",
    """        const handleDiceResolved = (payload: any) => {
            if (!payload || payload.playerNum === myPlayerNum) return;
            if (!isSynced) setIsSynced(true);""",
    code
)

code = code.replace(
    "if (!payload || payload.playerNum === myPlayerNum) return;\n            setRolling(false);\n            const roll = payload.rollValue || payload.roll;",
    "if (!payload || payload.playerNum === myPlayerNum) return;\n            if (!isSynced) setIsSynced(true);\n            setRolling(false);\n            const roll = payload.rollValue || payload.roll;"
)

# 15. resetGame
code = re.sub(
    r"        const newState: SnakeLadderState = \{\n            player1Position: 1,\n            player2Position: 1,\n            currentTurn: nextTurnId,\n            winner: null,\n            lastActionMessage: null,\n            lastPath: \[\],\n            lastPathPlayer: undefined,\n            version: state\.version \+ 1,\n            updatedAt: Date\.now\(\)\n        \};",
    """        const newPlayers: Record<string, SnakeLadderPlayer> = {};
        members.forEach(m => { newPlayers[m.id] = { position: 1 }; });
        const newState: SnakeLadderState = {
            players: newPlayers,
            currentTurn: nextTurnId,
            diceValue: null,
            winner: null,
            lastActionMessage: null,
            lastPath: [],
            lastPathPlayer: undefined,
            version: state.version + 1,
            updatedAt: Date.now()
        };""",
    code
)

# 16. UI changes for player1Position/player2Position -> members...
code = re.sub(
    r"state\.player1Position",
    "(members[0] && state.players && state.players[members[0].id] ? state.players[members[0].id].position : 1)",
    code
)
code = re.sub(
    r"state\.player2Position",
    "(members[1] && state.players && state.players[members[1].id] ? state.players[members[1].id].position : 1)",
    code
)

# 17. Loading guards (show loader until SYNC_STATE is received)
code = re.sub(
    r"\{loading \? \(",
    "{(loading || !isSynced) ? (",
    code
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(code)

print("Done")
