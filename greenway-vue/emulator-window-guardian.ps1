param(
  [int]$WaitSeconds = 45,
  [int]$TargetX = 40,
  [int]$TargetY = 40,
  [int]$TargetW = 420,
  [int]$TargetH = 820
)

Add-Type -AssemblyName System.Windows.Forms
Add-Type @"
using System;
using System.Runtime.InteropServices;

public static class WinApi {
  [DllImport("user32.dll", SetLastError=true)]
  public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

  [DllImport("user32.dll")]
  public static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);

  public struct RECT {
    public int Left;
    public int Top;
    public int Right;
    public int Bottom;
  }
}
"@

$SWP_NOZORDER = 0x0004
$SWP_SHOWWINDOW = 0x0040

$deadline = (Get-Date).AddSeconds($WaitSeconds)

while ((Get-Date) -lt $deadline) {
  $qemu = Get-Process qemu-system-x86_64 -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($null -ne $qemu -and $qemu.MainWindowHandle -ne 0) {
    $rect = New-Object WinApi+RECT
    [WinApi]::GetWindowRect([IntPtr]$qemu.MainWindowHandle, [ref]$rect) | Out-Null

    $screen = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea
    $isOffscreen = ($rect.Left -lt $screen.Left) -or ($rect.Top -lt $screen.Top) -or ($rect.Right -gt $screen.Right) -or ($rect.Bottom -gt $screen.Bottom)

    if ($isOffscreen) {
      [WinApi]::SetWindowPos([IntPtr]$qemu.MainWindowHandle, [IntPtr]::Zero, $TargetX, $TargetY, $TargetW, $TargetH, ($SWP_NOZORDER -bor $SWP_SHOWWINDOW)) | Out-Null
    }

    # Only fix initial position, then exit so user can freely drag/resize.
    break
  }

  Start-Sleep -Milliseconds 500
}
