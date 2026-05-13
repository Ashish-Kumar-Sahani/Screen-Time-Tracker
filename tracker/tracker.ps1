Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Text;

public class WindowTracker {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);

    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
}
"@

$handle = [WindowTracker]::GetForegroundWindow()
$buffer = New-Object System.Text.StringBuilder 512
[WindowTracker]::GetWindowText($handle, $buffer, 512) | Out-Null

$pidValue = 0
[WindowTracker]::GetWindowThreadProcessId($handle, [ref]$pidValue) | Out-Null
$process = Get-Process -Id $pidValue -ErrorAction SilentlyContinue

$result = @{
  title = $buffer.ToString()
  processName = if ($process) { $process.ProcessName } else { "Unknown" }
}

$result | ConvertTo-Json -Compress