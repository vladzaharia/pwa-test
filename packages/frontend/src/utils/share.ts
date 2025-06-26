export const shareApp = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'PWA Demo App',
        text: 'Check out this Progressive Web App demo!',
        url: window.location.href,
      })
    } catch (error) {
      console.log('Error sharing:', error)
    }
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(window.location.href)
    alert('Link copied to clipboard!')
  }
}
